import { PublicKey } from "@solana/web3.js";

// Define vault types that support direct withdrawal
export enum VaultType {
  STANDARD = "standard",
  ELEND = "elend",
}

// Configuration for vaults that support direct withdrawal
export interface DirectWithdrawalVaultConfig {
  type: VaultType;
  adaptorProgramId: PublicKey;
  kvaultAddress: PublicKey;
  lookUpTable: PublicKey;
}

// Map of vault addresses to their direct withdrawal configuration
export const DIRECT_WITHDRAWAL_VAULTS: Record<
  string,
  DirectWithdrawalVaultConfig
> = {
  "8oUwteX3SJELMGDPTEuLqz1WSd58yMdkQ6s4hKwB42nJ": {
    type: VaultType.ELEND,
    adaptorProgramId: new PublicKey(
      "to6Eti9CsC5FGkAtqiPphvKD2hiQiLsS8zWiDBqBPKR"
    ),
    kvaultAddress: new PublicKey(
      "A3hTCWdnfV6uiQLxRmnv17EpiEtmc93v1AGQnWy44Mup"
    ),
    lookUpTable: new PublicKey(
      "5UCZAkmBCfrU7qDzKZ5UiBL9JupUFftW2xMt2Eex6xop"
    ),
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
