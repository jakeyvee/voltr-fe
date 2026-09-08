import type { GetGenesisHashApi, Rpc } from "@solana/kit";

// Match Wallet Standard network identifiers to the SDK's canonical genesis hashes:
// https://github.com/anza-xyz/solana-sdk/blob/master/cluster-type/src/lib.rs
const networks = {
  "solana:mainnet": {
    walletAdapterNetwork: "mainnet-beta",
    genesisHash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  },
  "solana:devnet": {
    walletAdapterNetwork: "devnet",
    genesisHash: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  },
  "solana:testnet": {
    walletAdapterNetwork: "testnet",
    genesisHash: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY",
  },
} as const;

export type SolanaChain = keyof typeof networks;

export function getSolanaChain(
  configuredChain = process.env.NEXT_PUBLIC_SOLANA_CHAIN
): SolanaChain {
  // Preserve existing mainnet deployments; the RPC check still enforces this.
  const chain = configuredChain ?? "solana:mainnet";
  if (chain !== "solana:mainnet" && chain !== "solana:devnet" && chain !== "solana:testnet") {
    throw new Error("Unsupported Solana network configuration. Please contact support.");
  }
  return chain;
}

export function getWalletAdapterNetwork(chain: SolanaChain) {
  return networks[chain].walletAdapterNetwork;
}

export async function assertRpcMatchesChain(rpc: Rpc<GetGenesisHashApi>, chain: SolanaChain) {
  let genesisHash: string;
  try {
    // Fail before prompting if the configured network cannot be checked promptly.
    genesisHash = await rpc.getGenesisHash().send({ abortSignal: AbortSignal.timeout(10_000) });
  } catch (error) {
    throw new Error("Unable to verify the transaction network. Please try again.", { cause: error });
  }
  if (genesisHash !== networks[chain].genesisHash) {
    throw new Error("The configured Solana network does not match the RPC network. No transaction was sent. Please contact support.");
  }
}
