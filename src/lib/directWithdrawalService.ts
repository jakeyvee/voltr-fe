import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  NATIVE_MINT,
} from "@solana/spl-token";
import {
  DIRECT_WITHDRAWAL_VAULTS,
  VaultType,
  getDirectWithdrawalConfig,
  supportsDirectWithdrawal,
} from "./DirectWithdrawalConstants";
import {
  getKaminoVaultWithdrawAccounts,
  buildKaminoDirectWithdrawRemainingAccounts,
} from "./kaminoUtils";

export interface DirectWithdrawalInstructions {
  instructions: TransactionInstruction[];
  lookupTableAddresses: PublicKey[];
}

export class DirectWithdrawalService {
  private connection: Connection;
  private voltrClient: VoltrClient;

  constructor(connection: Connection) {
    this.connection = connection;
    this.voltrClient = new VoltrClient(connection);
  }

  /**
   * Check if a vault supports direct withdrawal
   */
  public supportsDirectWithdrawal(vaultAddress: string): boolean {
    return supportsDirectWithdrawal(vaultAddress);
  }

  /**
   * Create instructions for direct withdrawal from a vault
   */
  public async createDirectWithdrawalInstructions(
    vaultAddress: string,
    userPublicKey: PublicKey,
    assetMint: PublicKey,
    assetTokenProgram: PublicKey = TOKEN_PROGRAM_ID
  ): Promise<DirectWithdrawalInstructions> {
    const config = getDirectWithdrawalConfig(vaultAddress);
    if (!config) {
      throw new Error(
        `Vault ${vaultAddress} does not support direct withdrawal`
      );
    }

    const vault = new PublicKey(vaultAddress);
    const instructions: TransactionInstruction[] = [];
    const lookupTableAddresses: PublicKey[] = [];
    lookupTableAddresses.push(config.lookUpTable);

    // Setup user asset token account
    const userAssetAta = getAssociatedTokenAddressSync(
      assetMint,
      userPublicKey,
      false,
      assetTokenProgram
    );

    const createUserAssetAtaIx =
      createAssociatedTokenAccountIdempotentInstruction(
        userPublicKey,
        userAssetAta,
        userPublicKey,
        assetMint,
        assetTokenProgram
      );
    instructions.push(createUserAssetAtaIx);

    // Create vault-specific direct withdrawal instruction
    switch (config.type) {
      case VaultType.ELEND:
        await this.addKaminoDirectWithdrawalInstruction(
          instructions,
          lookupTableAddresses,
          vault,
          userPublicKey,
          assetMint,
          assetTokenProgram
        );
        break;
      default:
        throw new Error(`Unsupported vault type: ${config.type}`);
    }

    // Handle native SOL unwrapping if needed
    if (assetMint.equals(NATIVE_MINT)) {
      const closeWsolAccountIx = createCloseAccountInstruction(
        userAssetAta,
        userPublicKey,
        userPublicKey
      );
      instructions.push(closeWsolAccountIx);
    }

    return {
      instructions,
      lookupTableAddresses,
    };
  }

  /**
   * Add Kamino-specific direct withdrawal instruction
   */
  private async addKaminoDirectWithdrawalInstruction(
    instructions: TransactionInstruction[],
    lookupTableAddresses: PublicKey[],
    vault: PublicKey,
    userPublicKey: PublicKey,
    assetMint: PublicKey,
    assetTokenProgram: PublicKey
  ): Promise<void> {
    const kvault = DIRECT_WITHDRAWAL_VAULTS[vault.toBase58()].kvaultAddress;
    const { vaultStrategyAuth } = this.voltrClient.findVaultStrategyAddresses(
      vault,
      kvault
    );
    // Get Kamino-specific accounts
    const kaminoAccounts = await getKaminoVaultWithdrawAccounts(kvault);

    // Setup strategy shares account
    const vaultStrategySharesAta = getAssociatedTokenAddressSync(
      kaminoAccounts.sharesMint,
      vaultStrategyAuth,
      true,
      TOKEN_PROGRAM_ID
    );

    // Build remaining accounts for Kamino
    const remainingAccounts = await buildKaminoDirectWithdrawRemainingAccounts(
      lookupTableAddresses,
      kvault,
      assetMint,
      kaminoAccounts.sharesMint,
      vaultStrategySharesAta,
      kaminoAccounts.tokenVault,
      kaminoAccounts.baseVaultAuthority,
      kaminoAccounts.eventAuthority
    );

    // Create the direct withdraw instruction
    const directWithdrawIx =
      await this.voltrClient.createDirectWithdrawStrategyIx(
        {}, // args
        {
          user: userPublicKey,
          vault,
          vaultAssetMint: assetMint,
          assetTokenProgram,
          strategy: kvault,
          remainingAccounts,
          adaptorProgram:
            DIRECT_WITHDRAWAL_VAULTS[vault.toBase58()].adaptorProgramId,
        }
      );

    instructions.push(directWithdrawIx);
  }

  /**
   * Estimate if direct withdrawal will succeed (basic check)
   */
  public async canDirectWithdraw(
    vaultAddress: string,
    userPublicKey: PublicKey
  ): Promise<boolean> {
    try {
      if (!this.supportsDirectWithdrawal(vaultAddress)) {
        return false;
      }

      // Check if user has any LP tokens to withdraw
      const vault = new PublicKey(vaultAddress);
      const { vaultLpMint } = this.voltrClient.findVaultAddresses(vault);
      const userLpAta = getAssociatedTokenAddressSync(
        vaultLpMint,
        userPublicKey
      );

      const accountInfo = await this.connection.getAccountInfo(userLpAta);
      return accountInfo !== null;
    } catch (error) {
      console.error("Error checking direct withdrawal capability:", error);
      return false;
    }
  }
}
