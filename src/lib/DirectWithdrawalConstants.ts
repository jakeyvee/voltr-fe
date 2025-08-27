import { PublicKey } from "@solana/web3.js";

// Configuration for vaults that support direct withdrawal

type StrategyType = "drift" | "kamino" | "jupiter";

export interface DirectWithdrawalVaultConfig {
  lookUpTable: PublicKey;
  strategies: StrategyConfig[];
}
export interface StrategyConfig {
  address: PublicKey;
  adaptorProgramId: PublicKey;
  type: StrategyType;
}

export interface StrategyConfigDrift extends StrategyConfig {
  marketIndex: number;
}

export const JUPITER_LEND_PROGRAM_ID =
  "jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9";
export const JUPITER_LIQUIDITY_PROGRAM_ID =
  "jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC";
export const JUPITER_REWARDS_RATE_PROGRAM_ID =
  "jup7TthsMgcR9Y3L277b8Eo9uboVSmu1utkuXHNUKar";

const JUPITER_LEND_USDC_STRATEGY: StrategyConfig = {
  address: new PublicKey("2vVYHYM8VYnvZqQWpTJSj8o8DBf1wM8pVs3bsTgYZiqJ"),
  adaptorProgramId: new PublicKey(
    "EW35URAx3LiM13fFK3QxAXfGemHso9HWPixrv7YDY4AM"
  ),
  type: "jupiter",
};

const KAMINO_VAULT_TURBO_STRATEGY: StrategyConfig = {
  address: new PublicKey("A3hTCWdnfV6uiQLxRmnv17EpiEtmc93v1AGQnWy44Mup"),
  adaptorProgramId: new PublicKey(
    "to6Eti9CsC5FGkAtqiPphvKD2hiQiLsS8zWiDBqBPKR"
  ),
  type: "kamino",
};

export const DRIFT_SPOT_STATE = new PublicKey(
  "5zpq7DvB6UdFFvpmBPspGPNfUGoBRRCE2HHg5u3gxcsN"
);

export const DRIFT_LUT = new PublicKey(
  "Fpys8GRa5RBWfyeN7AaDUwFGD1zkDCA4z3t4CJLV8dfL"
);

const DRIFT_MAIN_USDC_STRATEGY: StrategyConfigDrift = {
  address: new PublicKey("GXWqPpjQpdz7KZw9p7f5PX2eGxHAhvpNXiviFkAB8zXg"),
  adaptorProgramId: new PublicKey(
    "EBN93eXs5fHGBABuajQqdsKRkCgaqtJa8vEFD6vKXiP"
  ),
  marketIndex: 0,
  type: "drift",
};

const DRIFT_JLP_USDC_STRATEGY: StrategyConfigDrift = {
  address: new PublicKey("TMoWTkuPJHArEeohUTWy3RYoMgfWqeCpzjPTLeGVYP9"),
  adaptorProgramId: new PublicKey(
    "EBN93eXs5fHGBABuajQqdsKRkCgaqtJa8vEFD6vKXiP"
  ),
  marketIndex: 34,
  type: "drift",
};

// Map of vault addresses to their direct withdrawal configuration
export const DIRECT_WITHDRAWAL_VAULTS: Record<
  string,
  DirectWithdrawalVaultConfig
> = {
  "8oUwteX3SJELMGDPTEuLqz1WSd58yMdkQ6s4hKwB42nJ": {
    lookUpTable: new PublicKey("5UCZAkmBCfrU7qDzKZ5UiBL9JupUFftW2xMt2Eex6xop"),
    strategies: [
      KAMINO_VAULT_TURBO_STRATEGY,
      DRIFT_MAIN_USDC_STRATEGY,
      DRIFT_JLP_USDC_STRATEGY,
      JUPITER_LEND_USDC_STRATEGY,
    ],
  },
};

// Check if a vault supports direct withdrawal
export const supportsDirectWithdrawal = (vaultAddress: string): boolean => {
  return vaultAddress in DIRECT_WITHDRAWAL_VAULTS;
};

// Get direct withdrawal configuration for a vault
export const getDirectWithdrawalConfig = (
  vaultAddress: string
): DirectWithdrawalVaultConfig | null => {
  return DIRECT_WITHDRAWAL_VAULTS[vaultAddress] || null;
};
