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
  StrategyConfigDrift,
  StrategyConfig,
  getDirectWithdrawalConfig,
  supportsDirectWithdrawal,
  DRIFT_LUT,
} from "./DirectWithdrawalConstants";
import {
  getKaminoVaultWithdrawAccounts,
  buildKaminoDirectWithdrawRemainingAccounts,
} from "./kaminoUtils";
import { BN } from "@coral-xyz/anchor";
import {
  buildDriftDirectWithdrawRemainingAccounts,
  getDriftEarnWithdrawAccounts,
} from "./driftUtils";

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
    inputAmountBN: BN,
    isWithdrawAll: boolean,
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

    const strategiesInitReceipts = config.strategies.map((strategy) =>
      this.voltrClient.findStrategyInitReceipt(vault, strategy.address)
    );

    const strategyValuesArray = await Promise.all(
      strategiesInitReceipts.map(
        async (receipt) =>
          await this.voltrClient
            .fetchStrategyInitReceiptAccount(receipt)
            .then((account) => {
              return {
                address: receipt.toBase58(),
                positionValue: account.positionValue,
              };
            })
      )
    );

    const strategyValues = new Map(
      strategyValuesArray.map((item) => [item.address, item.positionValue])
    );

    const configStrategies = config.strategies.sort((a, b) => {
      const aValue = strategyValues.get(
        this.voltrClient.findStrategyInitReceipt(vault, a.address).toBase58()
      );
      const bValue = strategyValues.get(
        this.voltrClient.findStrategyInitReceipt(vault, b.address).toBase58()
      );
      return bValue!.sub(aValue!).toNumber();
    });

    let leftOverAmount = inputAmountBN;

    for (const strategy of configStrategies) {
      const currentInputAmount = leftOverAmount.gt(
        strategyValues.get(
          this.voltrClient
            .findStrategyInitReceipt(vault, strategy.address)
            .toBase58()
        )!
      )
        ? strategyValues.get(
            this.voltrClient
              .findStrategyInitReceipt(vault, strategy.address)
              .toBase58()
          )!
        : leftOverAmount;

      leftOverAmount = leftOverAmount.sub(currentInputAmount);

      // Check if strategy is a Drift strategy
      if ("marketIndex" in strategy) {
        // Handle Drift strategy
        const driftStrategy = strategy as StrategyConfigDrift;
        await this.addDriftDirectWithdrawalInstruction(
          instructions,
          lookupTableAddresses,
          vault,
          driftStrategy.address,
          userPublicKey,
          assetMint,
          assetTokenProgram,
          driftStrategy.adaptorProgramId,
          driftStrategy.marketIndex,
          currentInputAmount,
          isWithdrawAll && leftOverAmount.isZero()
        );
      } else {
        // Handle regular strategy
        const regularStrategy = strategy as StrategyConfig;
        await this.addKaminoDirectWithdrawalInstruction(
          instructions,
          lookupTableAddresses,
          vault,
          regularStrategy.address,
          userPublicKey,
          assetMint,
          assetTokenProgram,
          regularStrategy.adaptorProgramId,
          currentInputAmount,
          isWithdrawAll && leftOverAmount.isZero()
        );
      }

      if (leftOverAmount.isZero()) {
        break;
      }
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
   * Add Drift-specific direct withdrawal instruction
   */
  private async addDriftDirectWithdrawalInstruction(
    instructions: TransactionInstruction[],
    lookupTableAddresses: PublicKey[],
    vault: PublicKey,
    strategy: PublicKey,
    userPublicKey: PublicKey,
    assetMint: PublicKey,
    assetTokenProgram: PublicKey,
    adaptorProgramId: PublicKey,
    marketIndex: number,
    inputAmountBN: BN,
    isWithdrawAll: boolean
  ): Promise<void> {
    const vaultLpMint = this.voltrClient.findVaultLpMint(vault);

    const requestWithdrawVaultReceipt =
      this.voltrClient.findRequestWithdrawVaultReceipt(vault, userPublicKey);
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        userPublicKey,
        getAssociatedTokenAddressSync(
          vaultLpMint,
          requestWithdrawVaultReceipt,
          true
        ),
        requestWithdrawVaultReceipt,
        vaultLpMint
      )
    );

    instructions.push(
      await this.voltrClient.createRequestWithdrawVaultIx(
        {
          amount: inputAmountBN,
          isAmountInLp: false,
          isWithdrawAll,
        },
        {
          payer: userPublicKey,
          userTransferAuthority: userPublicKey,
          vault,
        }
      )
    );

    const { vaultStrategyAuth } = this.voltrClient.findVaultStrategyAddresses(
      vault,
      strategy
    );

    // Get Kamino-specific accounts
    const driftAccounts = await getDriftEarnWithdrawAccounts(
      0,
      vaultStrategyAuth
    );

    // Build remaining accounts for Kamino
    const remainingAccounts = await buildDriftDirectWithdrawRemainingAccounts(
      this.connection,
      vaultStrategyAuth,
      strategy,
      driftAccounts.driftSigner,
      driftAccounts.userStats,
      driftAccounts.user,
      marketIndex
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
          strategy,
          remainingAccounts,
          adaptorProgram: adaptorProgramId,
        }
      );

    lookupTableAddresses.push(DRIFT_LUT);
    instructions.push(directWithdrawIx);
  }

  /**
   * Add Kamino-specific direct withdrawal instruction
   */
  private async addKaminoDirectWithdrawalInstruction(
    instructions: TransactionInstruction[],
    lookupTableAddresses: PublicKey[],
    vault: PublicKey,
    kvault: PublicKey,
    userPublicKey: PublicKey,
    assetMint: PublicKey,
    assetTokenProgram: PublicKey,
    adaptorProgramId: PublicKey,
    inputAmountBN: BN,
    isWithdrawAll: boolean
  ): Promise<void> {
    const vaultLpMint = this.voltrClient.findVaultLpMint(vault);

    const requestWithdrawVaultReceipt =
      this.voltrClient.findRequestWithdrawVaultReceipt(vault, userPublicKey);
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        userPublicKey,
        getAssociatedTokenAddressSync(
          vaultLpMint,
          requestWithdrawVaultReceipt,
          true
        ),
        requestWithdrawVaultReceipt,
        vaultLpMint
      )
    );

    instructions.push(
      await this.voltrClient.createRequestWithdrawVaultIx(
        {
          amount: inputAmountBN,
          isAmountInLp: false,
          isWithdrawAll,
        },
        {
          payer: userPublicKey,
          userTransferAuthority: userPublicKey,
          vault,
        }
      )
    );

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
          adaptorProgram: adaptorProgramId,
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

      const accountInfo = await this.connection.getAccountInfo(userLpAta, {
        commitment: "confirmed",
      });
      return accountInfo !== null;
    } catch (error) {
      console.error("Error checking direct withdrawal capability:", error);
      return false;
    }
  }
}
