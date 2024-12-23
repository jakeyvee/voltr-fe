import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
  BN,
  Wallet,
} from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { VoltrVault } from "./type/voltr_vault";
import { VoltrAdaptor } from "./type/voltr_adaptor";
import * as vaultIdl from "./idl/voltr_vault.json";
import * as adaptorIdl from "./idl/voltr_adaptor.json";

export const VAULT_PROGRAM_ID = new PublicKey(
  "EwAei87GBsgeLueC7mShT2TNbH3BYumP4RskusxUFBn6"
);
export const ADAPTOR_PROGRAM_ID = new PublicKey(
  "3BufioDyECNwuFJLRGCXNbZFrsnJnCsALMfDKjQEnk8x"
);

// Constants for PDA seeds
export const SEEDS = {
  VAULT_LP_MINT: Buffer.from("vault_lp_mint"),
  VAULT_LP_FEE_AUTH: Buffer.from("vault_lp_fee_auth"),
  VAULT_ASSET_IDLE_AUTH: Buffer.from("vault_asset_idle_auth"),
  ADAPTOR_STRATEGY: Buffer.from("adaptor_strategy"),
  VAULT_STRATEGY: Buffer.from("vault_strategy"),
  STRATEGY: Buffer.from("strategy"),
};

// Configuration interfaces
export interface VaultConfig {
  managementFee: number;
  performanceFee: number;
  maxCap: BN;
}

export interface VaultParams {
  config: VaultConfig;
  name: string;
  description: string;
}

// Custom wallet adapter that works in both Node.js and browser environments
class CustomWallet implements Wallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction(tx: any) {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: any[]) {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

class AccountUtils {
  conn: Connection;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    return this.conn.getBalance(publicKey);
  }
}

export class VoltrClient extends AccountUtils {
  provider!: AnchorProvider;
  vaultProgram!: Program<VoltrVault>;
  adaptorProgram!: Program<VoltrAdaptor>;
  vaultIdl!: Idl;
  adaptorIdl!: Idl;

  constructor(conn: Connection, wallet?: Keypair) {
    super(conn);

    // Initialize programs
    this.setProvider(wallet);
    this.setPrograms(vaultIdl as any, adaptorIdl as any);
  }

  private setProvider(wallet?: Keypair) {
    /// we are creating instructions with this client without signing
    let kp: Keypair;
    if (!wallet) {
      const leakedKp = Keypair.fromSecretKey(
        Uint8Array.from([
          208, 175, 150, 242, 88, 34, 108, 88, 177, 16, 168, 75, 115, 181, 199,
          242, 120, 4, 78, 75, 19, 227, 13, 215, 184, 108, 226, 53, 111, 149,
          179, 84, 137, 121, 79, 1, 160, 223, 124, 241, 202, 203, 220, 237, 50,
          242, 57, 158, 226, 207, 203, 188, 43, 28, 70, 110, 214, 234, 251, 15,
          249, 157, 62, 80,
        ])
      );
      kp = leakedKp;
    } else {
      kp = wallet;
    }

    this.provider = new AnchorProvider(
      this.conn,
      new CustomWallet(kp),
      AnchorProvider.defaultOptions()
    );
    setProvider(this.provider);
  }

  private setPrograms(vaultIdl?: Idl, adaptorIdl?: Idl) {
    this.vaultProgram = new Program<VoltrVault>(vaultIdl as any, this.provider);
    this.adaptorProgram = new Program<VoltrAdaptor>(
      adaptorIdl as any,
      this.provider
    );
  }

  // --------------------------------------- Find PDA addresses

  findVaultLpMint(vault: PublicKey) {
    const [vaultLpMint] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_LP_MINT, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultLpMint;
  }

  findVaultAssetIdleAuth(vault: PublicKey) {
    const [vaultAssetIdleAuth] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_ASSET_IDLE_AUTH, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultAssetIdleAuth;
  }

  findVaultLpFeeAuth(vault: PublicKey) {
    const [vaultLpFeeAuth] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_LP_FEE_AUTH, vault.toBuffer()],
      this.vaultProgram.programId
    );
    return vaultLpFeeAuth;
  }

  findVaultAddresses(vault: PublicKey) {
    const vaultLpMint = this.findVaultLpMint(vault);
    const vaultAssetIdleAuth = this.findVaultAssetIdleAuth(vault);
    const vaultLpFeeAuth = this.findVaultLpFeeAuth(vault);

    return {
      vaultLpMint,
      vaultAssetIdleAuth,
      vaultLpFeeAuth,
    };
  }

  findStrategy(counterpartyAssetTa: PublicKey) {
    const [strategy] = PublicKey.findProgramAddressSync(
      [SEEDS.STRATEGY, counterpartyAssetTa.toBuffer()],
      this.adaptorProgram.programId
    );
    return strategy;
  }

  findAdaptorStrategy(vault: PublicKey, strategy: PublicKey) {
    const [adaptorStrategy] = PublicKey.findProgramAddressSync(
      [SEEDS.ADAPTOR_STRATEGY, vault.toBuffer(), strategy.toBuffer()],
      this.vaultProgram.programId
    );
    return adaptorStrategy;
  }

  findVaultStrategy(vault: PublicKey, strategy: PublicKey) {
    const [vaultStrategy] = PublicKey.findProgramAddressSync(
      [SEEDS.VAULT_STRATEGY, vault.toBuffer(), strategy.toBuffer()],
      this.adaptorProgram.programId
    );
    return vaultStrategy;
  }

  findStrategyAddresses(vault: PublicKey, counterpartyAssetTa: PublicKey) {
    const strategy = this.findStrategy(counterpartyAssetTa);
    const adaptorStrategy = this.findAdaptorStrategy(vault, strategy);
    const vaultStrategy = this.findVaultStrategy(vault, strategy);

    return {
      strategy,
      adaptorStrategy,
      vaultStrategy,
    };
  }

  // --------------------------------------- Vault Instructions
  async createInitializeVaultIx({
    vault,
    vaultAssetMint,
    admin,
    manager,
    payer,
    vaultParams,
  }: {
    vault: Keypair;
    vaultAssetMint: PublicKey;
    admin: PublicKey;
    manager: PublicKey;
    payer: PublicKey;
    vaultParams: VaultParams;
  }): Promise<TransactionInstruction> {
    const addresses = this.findVaultAddresses(vault.publicKey);

    const vaultAssetIdleAta = getAssociatedTokenAddressSync(
      vaultAssetMint,
      addresses.vaultAssetIdleAuth,
      true
    );

    const vaultLpFeeAta = getAssociatedTokenAddressSync(
      addresses.vaultLpMint,
      addresses.vaultLpFeeAuth,
      true
    );

    return await this.vaultProgram.methods
      .initialize(vaultParams.config, vaultParams.name, vaultParams.description)
      .accounts({
        payer,
        admin,
        manager,
        vault: vault.publicKey,
        vaultAssetMint,
        vaultAssetIdleAta,
        vaultLpFeeAta,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  async createDepositIx(
    amount: BN,
    {
      userAuthority,
      vault,
      vaultAssetMint,
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const { vaultLpMint } = this.findVaultAddresses(vault);

    return await this.vaultProgram.methods
      .deposit(amount)
      .accounts({
        userTransferAuthority: userAuthority,
        vault,
        vaultAssetMint,
        vaultLpMint,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  async createWithdrawIx(
    amount: BN,
    {
      userAuthority,
      vault,
      vaultAssetMint,
    }: {
      userAuthority: PublicKey;
      vault: PublicKey;
      vaultAssetMint: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    const { vaultLpMint } = this.findVaultAddresses(vault);

    return await this.vaultProgram.methods
      .withdraw(amount)
      .accounts({
        userTransferAuthority: userAuthority,
        vault,
        vaultAssetMint,
        vaultLpMint,
        assetTokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
  }

  // --------------------------------------- Strategy Instructions
  async createStrategyIx(
    strategyType:
      | { marginfi: Record<string, never> }
      | { kamino: Record<string, never> }
      | { solend: Record<string, never> }
      | { driftx: Record<string, never> },
    {
      payer,
      admin,
      counterpartyAssetTa,
      protocolProgram,
    }: {
      payer: PublicKey;
      admin: PublicKey;
      counterpartyAssetTa: PublicKey;
      protocolProgram: PublicKey;
    }
  ): Promise<TransactionInstruction> {
    return await this.adaptorProgram.methods
      .createStrategy(strategyType)
      .accounts({
        payer,
        admin,
        counterpartyAssetTa,
        protocolProgram,
      })
      .instruction();
  }

  async addStrategyToVaultIx({
    payer,
    vault,
    strategy,
  }: {
    payer: PublicKey;
    vault: PublicKey;
    strategy: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .addStrategy()
      .accounts({
        payer,
        vault,
        strategy,
        adaptorProgram: this.adaptorProgram.programId,
      })
      .instruction();
  }

  async createDepositStrategyIx(
    amount: BN,
    {
      vault,
      vaultAssetMint,
      strategy,
      vaultStrategy,
      counterpartyAssetTa,
      remainingAccounts,
    }: {
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      vaultStrategy: PublicKey;
      counterpartyAssetTa: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .depositStrategy(amount)
      .accounts({
        vault,
        vaultAssetMint,
        adaptorProgram: this.adaptorProgram.programId,
        strategy,
        vaultStrategy,
        counterpartyAssetTa,
        assetTokenProgram: TOKEN_PROGRAM_ID,
        lpTokenProgram: TOKEN_PROGRAM_ID,
        protocolProgram: this.adaptorProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  async createWithdrawStrategyIx(
    amount: BN,
    {
      vault,
      vaultAssetMint,
      strategy,
      vaultStrategy,
      counterpartyAssetTa,
      counterpartyAssetTaAuth,
      remainingAccounts,
    }: {
      vault: PublicKey;
      vaultAssetMint: PublicKey;
      strategy: PublicKey;
      vaultStrategy: PublicKey;
      counterpartyAssetTa: PublicKey;
      counterpartyAssetTaAuth: PublicKey;
      remainingAccounts: Array<{
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }>;
    }
  ): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .withdrawStrategy(amount)
      .accounts({
        vault,
        vaultAssetMint,
        adaptorProgram: this.adaptorProgram.programId,
        strategy,
        vaultStrategy,
        counterpartyAssetTa,
        counterpartyAssetTaAuth,
        assetTokenProgram: TOKEN_PROGRAM_ID,
        lpTokenProgram: TOKEN_PROGRAM_ID,
        protocolProgram: this.adaptorProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();
  }

  async createRemoveStrategyIx({
    vault,
    strategy,
  }: {
    admin: PublicKey;
    vault: PublicKey;
    strategy: PublicKey;
  }): Promise<TransactionInstruction> {
    return await this.vaultProgram.methods
      .removeStrategy()
      .accounts({
        vault,
        strategy,
      })
      .instruction();
  }

  // --------------------------------------- Account Fetching
  async fetchVaultAccount(vault: PublicKey) {
    return await this.vaultProgram.account.vault.fetch(vault);
  }

  async fetchStrategyAccount(strategy: PublicKey) {
    return await this.adaptorProgram.account.strategy.fetch(strategy);
  }

  async fetchVaultStrategyAccount(vaultStrategy: PublicKey) {
    return await this.adaptorProgram.account.vaultStrategy.fetch(vaultStrategy);
  }

  async fetchAdaptorStrategyAccount(adaptorStrategy: PublicKey) {
    return await this.vaultProgram.account.adaptorStrategy.fetch(
      adaptorStrategy
    );
  }

  // --------------------------------------- Helpers

  async calculateAssetsForWithdraw(
    lpAmount: BN,
    vaultPk: PublicKey
  ): Promise<BN> {
    const vault = await this.fetchVaultAccount(vaultPk);
    const totalAssets = vault.asset.totalAmount;

    const lpMint = this.findVaultLpMint(vaultPk);
    const lp = await getMint(this.conn, lpMint);
    const lpSupply = new BN(lp.supply.toString());

    // Validate inputs
    if (lpSupply <= new BN(0)) throw new Error("Invalid LP supply");
    if (totalAssets <= new BN(0)) throw new Error("Invalid total assets");

    // Calculate: (lpAmount * totalAssets) / totalLpSupply
    try {
      return lpAmount.mul(totalAssets).div(lpSupply);
    } catch (e) {
      throw new Error("Math overflow in asset calculation");
    }
  }

  async calculateLpTokensForDeposit(
    depositAmount: BN,
    vaultPk: PublicKey
  ): Promise<BN> {
    const vault = await this.fetchVaultAccount(vaultPk);
    const totalAssets = vault.asset.totalAmount;
    const lpMint = this.findVaultLpMint(vaultPk);

    const [lp, asset] = await Promise.all([
      getMint(this.conn, lpMint),
      getMint(this.conn, vault.asset.assetMint),
    ]);
    const lpSupply = new BN(lp.supply.toString());

    // If the pool is empty, mint LP tokens 1:1 with deposit
    if (totalAssets <= new BN(0) && lpSupply <= new BN(0)) {
      const assetDecimals = asset.decimals;
      return depositAmount
        .mul(new BN(10 ** lp.decimals))
        .div(new BN(10 ** assetDecimals));
    }

    // Calculate: (depositAmount * totalLpSupply) / totalAssets
    try {
      return depositAmount.mul(lpSupply).div(totalAssets);
    } catch (e) {
      throw new Error("Math overflow in LP token calculation");
    }
  }
}

export default VoltrClient;
