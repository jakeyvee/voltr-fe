import {
  assertIsFullySignedTransaction,
  assertIsTransactionWithinSizeLimit,
  getBase58Decoder,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageDecoder,
  getSolanaErrorFromTransactionError,
  getTransactionDecoder,
  signature,
  type GetGenesisHashApi,
  type GetSignatureStatusesApi,
  type Rpc,
  type SendTransactionApi,
  type Signature,
} from "@solana/kit";
import {
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignTransactionFeature,
} from "@solana/wallet-standard-features";
import type { IdentifierString, Wallet } from "@wallet-standard/base";
import { assertRpcMatchesChain, type SolanaChain } from "./solanaChain";

type TransactionRpc = Rpc<GetGenesisHashApi & GetSignatureStatusesApi & SendTransactionApi>;
type WalletAdapterState = {
  readonly connected: boolean;
  readonly publicKey: { toBase58(): string } | null;
};

// TODO: Remove this type widening when Wallet Standard includes v1 in its types.
// A wallet must explicitly advertise numeric 1 before we use raw-byte signing.
type WithV1Versions<T> = Omit<T, "supportedTransactionVersions"> & {
  supportedTransactionVersions: ReadonlyArray<"legacy" | number>;
};
type V1SignTransaction = WithV1Versions<
  SolanaSignTransactionFeature[typeof SolanaSignTransaction]
>;
type V1SignAndSendTransaction = WithV1Versions<
  SolanaSignAndSendTransactionFeature[typeof SolanaSignAndSendTransaction]
>;

function supportsV1(feature: unknown): feature is Record<string, unknown> {
  return (
    typeof feature === "object" &&
    feature !== null &&
    "version" in feature &&
    feature.version === "1.0.0" &&
    "supportedTransactionVersions" in feature &&
    Array.isArray(feature.supportedTransactionVersions) &&
    feature.supportedTransactionVersions.includes(1)
  );
}

function supportsV1Signing(feature: unknown): feature is V1SignTransaction {
  return supportsV1(feature) && typeof feature.signTransaction === "function";
}

function supportsV1Sending(feature: unknown): feature is V1SignAndSendTransaction {
  return (
    supportsV1(feature) && typeof feature.signAndSendTransaction === "function"
  );
}

function getStandardWallet(
  adapter: WalletAdapterState | undefined,
  walletAddress: string
): Wallet | undefined {
  if (
    adapter &&
    "standard" in adapter &&
    adapter.standard === true &&
    "wallet" in adapter
  ) {
    // Read live adapter state in case the user switched accounts or disconnected
    // while the API was building the transaction.
    if (!adapter.connected || adapter.publicKey?.toBase58() !== walletAddress) {
      throw new Error("The connected wallet account changed. Reconnect your wallet and try again.");
    }
    // StandardWalletAdapter exposes its original Wallet Standard wallet publicly.
    return adapter.wallet as Wallet;
  }
}

async function sendV1Transaction({
  transactionBytes,
  walletAddress,
  adapter,
  chain,
  rpc,
}: {
  transactionBytes: Uint8Array;
  walletAddress: string;
  adapter: WalletAdapterState | undefined;
  chain: IdentifierString;
  rpc: TransactionRpc;
}): Promise<Signature> {
  const wallet = getStandardWallet(adapter, walletAddress);
  if (!wallet) {
    throw new Error("Your wallet cannot sign v1 transactions. Update it or connect a wallet with v1 support.");
  }
  const account = wallet.accounts.find((candidate) => candidate.address === walletAddress);
  if (!account) {
    throw new Error("The connected wallet account is unavailable. Reconnect your wallet.");
  }
  if (!wallet.chains.includes(chain) || !account.chains.includes(chain)) {
    throw new Error("Your wallet account does not support the selected Solana network.");
  }

  const input = { account, chain, transaction: transactionBytes };
  const signFeature = wallet.features[SolanaSignTransaction];
  if (account.features.includes(SolanaSignTransaction) && supportsV1Signing(signFeature)) {
    const [output] = await signFeature.signTransaction({
      ...input,
      options: { preflightCommitment: "confirmed" },
    });
    if (!output) throw new Error("Your wallet did not return a signed transaction.");

    // Wallets may refresh the blockhash or change the transaction they sign.
    const signed = getTransactionDecoder().decode(output.signedTransaction);
    getCompiledTransactionMessageDecoder().decode(signed.messageBytes);
    assertIsFullySignedTransaction(signed);
    assertIsTransactionWithinSizeLimit(signed);
    return rpc.sendTransaction(getBase64EncodedWireTransaction(signed), {
      encoding: "base64",
      preflightCommitment: "confirmed",
      skipPreflight: false,
    }).send();
  }

  const sendFeature = wallet.features[SolanaSignAndSendTransaction];
  if (account.features.includes(SolanaSignAndSendTransaction) && supportsV1Sending(sendFeature)) {
    const [output] = await sendFeature.signAndSendTransaction({
      ...input,
      options: {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        skipPreflight: false,
      },
    });
    if (!output) throw new Error("Your wallet did not return a transaction signature.");
    return signature(getBase58Decoder().decode(output.signature));
  }

  throw new Error("Your wallet cannot sign v1 transactions. Update it or connect a wallet with v1 support.");
}

function waitForNextStatus(delay: number, abortSignal: AbortSignal): Promise<void> {
  abortSignal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortSignal.reason);
    };
    const timer = setTimeout(() => {
      abortSignal.removeEventListener("abort", onAbort);
      resolve();
    }, delay);
    abortSignal.addEventListener("abort", onAbort, { once: true });
  });
}

async function confirmSubmittedTransaction(rpc: TransactionRpc, transactionSignature: Signature) {
  // The API and sign-and-send wallets do not supply the actual expiry height.
  // Bound the wait to two minutes so an unconfirmed transaction doesn't keep the
  // action loading indefinitely. Its signature remains available for checking.
  const abortSignal = AbortSignal.timeout(120_000);
  // Poll healthy responses every two seconds; repeated RPC failures back off to
  // ten seconds to reduce load on rate-limited endpoints.
  const pollInterval = 2000;
  let retryDelay = pollInterval;
  const getStatus = async () => {
    try {
      abortSignal.throwIfAborted();
      const { value: [status] } = await rpc.getSignatureStatuses(
        [transactionSignature],
        { searchTransactionHistory: true }
      ).send({ abortSignal });
      if (status === undefined) throw new Error("The RPC returned an invalid signature status.");
      retryDelay = pollInterval;
      return status;
    } catch (error) {
      if (abortSignal.aborted) throw error;
      await waitForNextStatus(retryDelay, abortSignal);
      retryDelay = Math.min(retryDelay * 2, 10_000);
      return undefined;
    }
  };
  try {
    while (true) {
      const status = await getStatus();
      if (status === undefined) continue;
      // Execution errors are terminal; only transport/RPC lookup failures retry.
      if (status?.err) throw getSolanaErrorFromTransactionError(status.err);
      if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
        return;
      }
      await waitForNextStatus(pollInterval, abortSignal);
    }
  } catch (error) {
    if (!abortSignal.aborted) throw error;
    throw new Error(
      `Transaction submitted but confirmation timed out. Check ${transactionSignature} before trying again.`,
      { cause: error }
    );
  }
}

export async function submitApiTransaction({
  serializedTransaction,
  walletAddress,
  adapter,
  sendLegacyTransaction,
  rpc,
  chain,
}: {
  serializedTransaction: unknown;
  walletAddress: string;
  adapter: WalletAdapterState | undefined;
  sendLegacyTransaction: (transactionBytes: Uint8Array) => Promise<string>;
  rpc: TransactionRpc;
  chain: SolanaChain;
}): Promise<Signature> {
  if (typeof serializedTransaction !== "string" || serializedTransaction.length === 0) {
    throw new Error("The API did not return a transaction. Please try again.");
  }
  const transactionBytes = new Uint8Array(getBase58Encoder().encode(serializedTransaction));
  const transaction = getTransactionDecoder().decode(transactionBytes);
  const message = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes);
  assertIsTransactionWithinSizeLimit(transaction);
  if (!(walletAddress in transaction.signatures)) {
    throw new Error("This transaction does not request a signature from the connected wallet.");
  }

  // Check the same RPC used for submission and confirmation before any wallet
  // prompt, including wallets that broadcast through their own RPC.
  await assertRpcMatchesChain(rpc, chain);
  const transactionSignature = message.version === 1
    ? await sendV1Transaction({ transactionBytes, walletAddress, adapter, chain, rpc })
    : signature(await sendLegacyTransaction(transactionBytes));
  await confirmSubmittedTransaction(rpc, transactionSignature);
  return transactionSignature;
}
