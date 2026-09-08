import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { setImmediate } from "node:timers/promises";
import {
  address,
  appendTransactionMessageInstruction,
  blockhash,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  generateKeyPairSigner,
  getAddressEncoder,
  getBase58Decoder,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  getTransactionEncoder,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  setTransactionMessageLoadedAccountsDataSizeLimit,
  signTransaction,
  type TransactionVersion,
} from "@solana/kit";
import {
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
  type SolanaSignTransactionInput,
} from "@solana/wallet-standard-features";
import { VersionedTransaction } from "@solana/web3.js";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import { submitApiTransaction } from "../src/lib/apiTransaction";
import { getTransactionErrorMessage } from "../src/lib/transactionError";
import { getSolanaChain, getWalletAdapterNetwork } from "../src/lib/solanaChain";

const signer = await generateKeyPairSigner();
const otherSigner = await generateKeyPairSigner();
const mainnetGenesisHash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
const devnetGenesisHash = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

async function fixture(version: TransactionVersion, dataSize = 12, lifetime = signer.address) {
  const message = pipe(
    createTransactionMessage({ version }),
    (m) => setTransactionMessageFeePayer(signer.address, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash({
      blockhash: blockhash(lifetime),
      lastValidBlockHeight: BigInt(100),
    }, m),
    (m) => appendTransactionMessageInstruction({
      programAddress: address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: new Uint8Array(dataSize).fill(65),
    }, m)
  );
  const configured = message.version === 1
    ? setTransactionMessageLoadedAccountsDataSizeLimit(
        65536,
        setTransactionMessageComputeUnitLimit(30000, message)
      )
    : message;
  const unsigned = compileTransaction(configured);
  const signed = await signTransaction([signer.keyPair], unsigned);
  const bytes = new Uint8Array(getTransactionEncoder().encode(unsigned));
  return {
    bytes,
    serialized: getBase58Decoder().decode(bytes),
    signedBytes: new Uint8Array(getTransactionEncoder().encode(signed)),
    signedBase64: getBase64EncodedWireTransaction(signed),
    signature: getSignatureFromTransaction(signed),
  };
}

function adapter(features: Wallet["features"], overrides: Partial<WalletAccount> = {}) {
  const account: WalletAccount = {
    address: signer.address,
    publicKey: getAddressEncoder().encode(signer.address),
    chains: ["solana:mainnet", "solana:devnet", "solana:testnet"],
    features: [SolanaSignTransaction, SolanaSignAndSendTransaction],
    ...overrides,
  };
  const wallet: Wallet = {
    version: "1.0.0",
    name: "Test wallet",
    icon: "data:image/svg+xml;base64,",
    chains: ["solana:mainnet", "solana:devnet", "solana:testnet"],
    accounts: [account],
    features,
  };
  return {
    standard: true,
    connected: true,
    publicKey: { toBase58: () => signer.address },
    wallet,
  };
}

type Status = null | {
  slot: number;
  confirmations: number;
  confirmationStatus: "processed" | "confirmed" | "finalized";
  err: null | string | Record<string, unknown>;
};

type StatusResponse = Status | Error | { httpStatus: number } | {
  rpcError: { code: number; message: string };
};

function rpcHarness(t: TestContext, transactionSignature: string, statuses: Array<StatusResponse> = [{
  slot: 10, confirmations: 1, confirmationStatus: "confirmed", err: null,
}], genesisHash = mainnetGenesisHash) {
  // Keep transaction RPC calls separate from the network verification request.
  const calls: Array<{ method: string; params: Array<unknown> }> = [];
  const genesisRequests: Array<string> = [];
  t.mock.method(globalThis, "fetch", async (_input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    init?.signal?.throwIfAborted();
    assert.equal(typeof init?.body, "string");
    const payload: { id: string; method: string; params: Array<unknown> } = JSON.parse(String(init?.body));
    if (payload.method === "getGenesisHash") {
      genesisRequests.push(genesisHash);
      return Response.json({ jsonrpc: "2.0", id: payload.id, result: genesisHash });
    }
    calls.push({ method: payload.method, params: payload.params });
    let result: unknown;
    if (payload.method === "sendTransaction") {
      result = transactionSignature;
    } else if (payload.method === "getSignatureStatuses") {
      assert.deepEqual(payload.params, [[transactionSignature], { searchTransactionHistory: true }]);
      const next = statuses.length > 1 ? statuses.shift() : statuses[0];
      if (next instanceof Error) throw next;
      if (next && "httpStatus" in next) return new Response(null, { status: next.httpStatus });
      if (next && "rpcError" in next) {
        return Response.json({ jsonrpc: "2.0", id: payload.id, error: next.rpcError });
      }
      result = { context: { slot: 10 }, value: [next] };
    } else {
      assert.fail(`Unexpected RPC method: ${payload.method}`);
    }
    return Response.json({ jsonrpc: "2.0", id: payload.id, result });
  });
  return { rpc: createSolanaRpc("http://localhost:8899"), calls, genesisRequests };
}

function useConfirmationClock(t: TestContext) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(AbortSignal, "timeout", (milliseconds: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), milliseconds);
    return controller.signal;
  });
  return async (milliseconds: number) => {
    t.mock.timers.tick(milliseconds);
    // Let Kit's HTTP transport and the confirmation loop settle between ticks.
    await setImmediate();
  };
}

const noLegacySend = async () => assert.fail("v1 reached the legacy wallet adapter");

test("signs a transaction larger than 1232 bytes through Wallet Standard and submits base64", async (t) => {
  const tx = await fixture(1, 1800);
  assert(tx.bytes.length > 1232 && tx.bytes.length <= 4096);
  const inputs: Array<SolanaSignTransactionInput> = [];
  const selectedAdapter = adapter({
    [SolanaSignTransaction]: {
      version: "1.0.0", supportedTransactionVersions: ["legacy", 0, 1],
      async signTransaction(input: SolanaSignTransactionInput) {
        inputs.push(input);
        return [{ signedTransaction: tx.signedBytes }];
      },
    },
  });
  const { rpc, calls } = rpcHarness(t, tx.signature);
  assert.equal(await submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
  }), tx.signature);
  assert.equal(inputs.length, 1);
  assert.deepEqual(inputs[0].transaction, tx.bytes);
  assert.equal(inputs[0].account, selectedAdapter.wallet.accounts[0]);
  assert.equal(inputs[0].chain, "solana:mainnet");
  assert.deepEqual(calls[0], {
    method: "sendTransaction",
    params: [tx.signedBase64, { encoding: "base64", preflightCommitment: "confirmed", skipPreflight: false }],
  });
  assert.equal(calls[1].method, "getSignatureStatuses");
});

for (const version of ["legacy", 0] as const) {
  test(`preserves the existing wallet adapter path for ${version}`, async (t) => {
    const tx = await fixture(version);
    const { rpc, calls } = rpcHarness(t, tx.signature);
    let legacyCalls = 0;
    await submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction: tx.serialized, walletAddress: signer.address, adapter: undefined, rpc,
      sendLegacyTransaction: async (bytes) => {
        legacyCalls++;
        assert.equal(VersionedTransaction.deserialize(bytes).version, version);
        assert.deepEqual(bytes, tx.bytes);
        return tx.signature;
      },
    });
    assert.equal(legacyCalls, 1);
    assert.deepEqual(calls.map((call) => call.method), ["getSignatureStatuses"]);
  });
}

test("submits the wallet-returned transaction after a blockhash refresh", async (t) => {
  const original = await fixture(1);
  const refreshed = await fixture(1, 12, otherSigner.address);
  assert.notEqual(original.signature, refreshed.signature);
  const { rpc, calls } = rpcHarness(t, refreshed.signature);
  const selectedAdapter = adapter({
    [SolanaSignTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      async signTransaction() { return [{ signedTransaction: refreshed.signedBytes }]; },
    },
  });
  await submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: original.serialized, walletAddress: signer.address,
    adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
  });
  assert.equal(calls[0].params[0], refreshed.signedBase64);
});

for (const versions of [["legacy", 0], ["1"], []]) {
  test(`rejects a wallet that advertises versions ${JSON.stringify(versions)}`, async (t) => {
    const tx = await fixture(1);
    const { rpc, calls } = rpcHarness(t, tx.signature);
    const selectedAdapter = adapter({
      [SolanaSignTransaction]: {
        version: "1.0.0", supportedTransactionVersions: versions,
        signTransaction: () => assert.fail("unsupported wallet was prompted"),
      },
    });
    await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction: tx.serialized, walletAddress: signer.address,
      adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
    }), /wallet cannot sign v1/);
    assert.equal(calls.length, 0);
  });
}

test("rejects v1 for an adapter without Wallet Standard support", async (t) => {
  const tx = await fixture(1);
  const { rpc, calls } = rpcHarness(t, tx.signature);
  await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: { connected: true, publicKey: { toBase58: () => signer.address } },
    sendLegacyTransaction: noLegacySend, rpc,
  }), /wallet cannot sign v1/);
  assert.equal(calls.length, 0);
});

for (const connection of [
  { connected: false, publicKey: null },
  { connected: true, publicKey: { toBase58: () => otherSigner.address } },
]) {
  test(`rejects an adapter that ${connection.connected ? "changed accounts" : "disconnected"} during the API request`, async (t) => {
    const tx = await fixture(1);
    const { rpc, calls } = rpcHarness(t, tx.signature);
    const selectedAdapter = adapter({
      [SolanaSignTransaction]: {
        version: "1.0.0", supportedTransactionVersions: [1],
        signTransaction: () => assert.fail("stale wallet account was prompted"),
      },
    });
    await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction: tx.serialized, walletAddress: signer.address,
      adapter: { ...selectedAdapter, ...connection }, sendLegacyTransaction: noLegacySend, rpc,
    }), /connected wallet account changed/);
    assert.equal(calls.length, 0);
  });
}

for (const [name, overrides] of [
  ["different connected account", { address: otherSigner.address }],
  ["account without signing permission", { features: [] }],
  ["account on a different chain", { chains: ["solana:devnet"] }],
] satisfies Array<[string, Partial<WalletAccount>]>) {
  test(`rejects ${name} before prompting`, async (t) => {
    const tx = await fixture(1);
    const { rpc, calls } = rpcHarness(t, tx.signature);
    const selectedAdapter = adapter({
      [SolanaSignTransaction]: {
        version: "1.0.0", supportedTransactionVersions: [1],
        signTransaction: () => assert.fail("unauthorized account was prompted"),
      },
    }, overrides);
    await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction: tx.serialized, walletAddress: signer.address,
      adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
    }));
    assert.equal(calls.length, 0);
  });
}

test("does not try a second signing method after wallet rejection", async (t) => {
  const tx = await fixture(1);
  const rejected = new Error("User rejected the request");
  const { rpc, calls } = rpcHarness(t, tx.signature);
  const selectedAdapter = adapter({
    [SolanaSignTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      async signTransaction() { throw rejected; },
    },
    [SolanaSignAndSendTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      signAndSendTransaction: () => assert.fail("wallet was prompted twice"),
    },
  });
  await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
  }), (error) => error === rejected);
  assert.equal(calls.length, 0);
});

test("uses sign-and-send when it is the wallet's only v1-capable signing feature", async (t) => {
  const tx = await fixture(1, 1800);
  const { rpc, calls } = rpcHarness(t, tx.signature);
  let sends = 0;
  const selectedAdapter = adapter({
    [SolanaSignTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [0],
      signTransaction: () => assert.fail("v0-only signing was used for v1"),
    },
    [SolanaSignAndSendTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      async signAndSendTransaction(input: SolanaSignTransactionInput) {
        sends++;
        assert.deepEqual(input.transaction, tx.bytes);
        return [{ signature: new Uint8Array(getBase58Encoder().encode(tx.signature)) }];
      },
    },
  });
  assert.equal(await submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
  }), tx.signature);
  assert.equal(sends, 1);
  assert.deepEqual(calls.map((call) => call.method), ["getSignatureStatuses"]);
});

test("reports an onchain failure instead of displaying success", async (t) => {
  const tx = await fixture(0);
  const { rpc } = rpcHarness(t, tx.signature, [{
    slot: 10, confirmations: 1, confirmationStatus: "confirmed", err: "AccountNotFound",
  }]);
  await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: undefined, sendLegacyTransaction: async () => tx.signature, rpc,
  }), (error) => /Not enough SOL/.test(getTransactionErrorMessage(error)));
});

test("waits for confirmed status rather than treating processed as success", async (t) => {
  const tx = await fixture(0);
  const { rpc, calls } = rpcHarness(t, tx.signature, [
    { slot: 10, confirmations: 0, confirmationStatus: "processed", err: null },
    { slot: 10, confirmations: 1, confirmationStatus: "confirmed", err: null },
  ]);
  await submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: undefined, sendLegacyTransaction: async () => tx.signature, rpc,
  });
  assert.equal(calls.length, 2);
});

test("confirmation timeout reports a pending signature without resubmitting", async (t) => {
  const advance = useConfirmationClock(t);
  const tx = await fixture(0);
  const { rpc } = rpcHarness(t, tx.signature, [null]);
  let sends = 0;
  const pending = assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address, adapter: undefined, rpc,
    sendLegacyTransaction: async () => { sends++; return tx.signature; },
  }), (error) => error instanceof Error && error.message.includes(tx.signature) && /confirmation timed out/.test(error.message));
  await advance(0);
  await advance(120_000);
  await pending;
  assert.equal(sends, 1);
});

test("persistent confirmation failures exhaust the timeout budget without resubmitting", async (t) => {
  const advance = useConfirmationClock(t);
  const tx = await fixture(0);
  const { rpc, calls } = rpcHarness(t, tx.signature, [{ httpStatus: 429 }]);
  let sends = 0;
  const pending = assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address, adapter: undefined,
    rpc,
    sendLegacyTransaction: async () => { sends++; return tx.signature; },
  }), (error) => error instanceof Error && error.message.includes(tx.signature) && /confirmation timed out/.test(error.message));
  await advance(0);
  await advance(2000);
  await advance(4000);
  await advance(8000);
  await advance(10_000);
  assert.equal(calls.length, 5);
  await advance(96_000);
  await pending;
  assert.equal(sends, 1);
});

test("rejects an unsigned wallet response before broadcasting", async (t) => {
  const tx = await fixture(1);
  const { rpc, calls } = rpcHarness(t, tx.signature);
  const selectedAdapter = adapter({
    [SolanaSignTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      async signTransaction() { return [{ signedTransaction: tx.bytes }]; },
    },
  });
  await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
    serializedTransaction: tx.serialized, walletAddress: signer.address,
    adapter: selectedAdapter, sendLegacyTransaction: noLegacySend, rpc,
  }));
  assert.equal(calls.length, 0);
});

for (const [version, size] of [[1, 4100], [0, 1300]] as const) {
  test(`rejects oversized version ${version} input before signing`, async (t) => {
    const tx = await fixture(version, size);
    const { rpc, calls } = rpcHarness(t, tx.signature);
    await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction: tx.serialized, walletAddress: signer.address,
      adapter: undefined, sendLegacyTransaction: noLegacySend, rpc,
    }), (error) => /size limit/.test(getTransactionErrorMessage(error)));
    assert.equal(calls.length, 0);
  });
}

test("rejects missing or malformed API transaction data", async (t) => {
  const tx = await fixture(1);
  const { rpc, calls } = rpcHarness(t, tx.signature);
  for (const serializedTransaction of [undefined, "", "!not-base58!", getBase58Decoder().decode(tx.bytes.slice(0, 10))]) {
    await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet",
      serializedTransaction, walletAddress: signer.address,
      adapter: undefined, sendLegacyTransaction: noLegacySend, rpc,
    }), (error) => /API did not return a transaction|transaction data is invalid/.test(getTransactionErrorMessage(error)));
  }
  assert.equal(calls.length, 0);
});

test("backs off after HTTP and network failures, then confirms without resubmitting", async (t) => {
  const advance = useConfirmationClock(t);
  const tx = await fixture(0);
  const { rpc, calls } = rpcHarness(t, tx.signature, [
    { httpStatus: 429 },
    { httpStatus: 503 },
    new TypeError("Failed to fetch"),
    { rpcError: { code: -32603, message: "Internal error" } },
    { slot: 10, confirmations: 1, confirmationStatus: "confirmed", err: null },
  ]);
  let sends = 0;
  const pending = submitApiTransaction({
    chain: "solana:mainnet", serializedTransaction: tx.serialized,
    walletAddress: signer.address, adapter: undefined, rpc,
    sendLegacyTransaction: async () => { sends++; return tx.signature; },
  });
  await advance(0);
  assert.equal(calls.length, 1);
  for (const delay of [2000, 4000, 8000, 10_000]) {
    const before: number = calls.length;
    await advance(delay - 1);
    assert.equal(calls.length, before);
    await advance(1);
    assert.equal(calls.length, before + 1);
  }
  assert.equal(await pending, tx.signature);
  assert.equal(sends, 1);
});

test("onchain failure after a transient RPC error is terminal", async (t) => {
  const advance = useConfirmationClock(t);
  const tx = await fixture(0);
  const { rpc, calls } = rpcHarness(t, tx.signature, [
    { httpStatus: 429 },
    { slot: 10, confirmations: 1, confirmationStatus: "confirmed", err: { InstructionError: [0, { Custom: 6001 }] } },
  ]);
  const pending = assert.rejects(submitApiTransaction({
    chain: "solana:mainnet", serializedTransaction: tx.serialized,
    walletAddress: signer.address, adapter: undefined, rpc,
    sendLegacyTransaction: async () => tx.signature,
  }), (error) => /program error 6001/.test(getTransactionErrorMessage(error)));
  await advance(0);
  await advance(2000);
  await pending;
  await advance(10_000);
  assert.equal(calls.length, 2);
});

for (const feature of [SolanaSignTransaction, SolanaSignAndSendTransaction]) {
  test(`rejects a mainnet/devnet mismatch before ${feature}`, async (t) => {
    const tx = await fixture(1);
    const { rpc, calls, genesisRequests } = rpcHarness(t, tx.signature, undefined, devnetGenesisHash);
    const selectedAdapter = adapter({
      [feature]: {
        version: "1.0.0", supportedTransactionVersions: [1],
        signTransaction: () => assert.fail("wallet was prompted on the wrong network"),
        signAndSendTransaction: () => assert.fail("wallet broadcast on the wrong network"),
      },
    });
    await assert.rejects(submitApiTransaction({
      chain: "solana:mainnet", serializedTransaction: tx.serialized,
      walletAddress: signer.address, adapter: selectedAdapter, rpc,
      sendLegacyTransaction: noLegacySend,
    }), /does not match the RPC network/);
    assert.equal(genesisRequests.length, 1);
    assert.equal(calls.length, 0);
  });
}

test("uses the configured devnet chain for wallet broadcasting and confirmation", async (t) => {
  const tx = await fixture(1);
  const { rpc, calls, genesisRequests } = rpcHarness(t, tx.signature, undefined, devnetGenesisHash);
  const selectedAdapter = adapter({
    [SolanaSignAndSendTransaction]: {
      version: "1.0.0", supportedTransactionVersions: [1],
      async signAndSendTransaction(input: SolanaSignTransactionInput) {
        assert.equal(input.chain, "solana:devnet");
        assert.equal(genesisRequests.length, 1);
        return [{ signature: new Uint8Array(getBase58Encoder().encode(tx.signature)) }];
      },
    },
  });
  assert.equal(await submitApiTransaction({
    chain: getSolanaChain("solana:devnet"), serializedTransaction: tx.serialized,
    walletAddress: signer.address, adapter: selectedAdapter, rpc,
    sendLegacyTransaction: noLegacySend,
  }), tx.signature);
  assert.deepEqual(calls.map((call) => call.method), ["getSignatureStatuses"]);
  assert.equal(getWalletAdapterNetwork(getSolanaChain("solana:devnet")), "devnet");
});

test("fails before signing when the RPC network cannot be verified", async (t) => {
  const tx = await fixture(0);
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }));
  await assert.rejects(submitApiTransaction({
    chain: "solana:mainnet", serializedTransaction: tx.serialized,
    walletAddress: signer.address, adapter: undefined,
    rpc: createSolanaRpc("http://localhost:8899"),
    sendLegacyTransaction: () => assert.fail("wallet was prompted before verification"),
  }), /Unable to verify the transaction network/);
});

test("rejects unsupported chain configuration", () => {
  for (const chain of ["", "mainnet", "solana:localnet", "toString"]) {
    assert.throws(() => getSolanaChain(chain), /Unsupported Solana network/);
  }
});
