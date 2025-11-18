import {
  DEFAULT_KLEND_PROGRAM_ID,
  getMedianSlotDurationInMsFromLastEpochs,
  getTokenOracleData,
  KaminoReserve,
  KaminoVault,
  KVAULTS_PROGRAM_ID,
  parseTokenSymbol,
  Reserve,
  VaultState,
} from "@kamino-finance/klend-sdk";
import {
  address,
  Address,
  createDefaultRpcTransport,
  createRpc,
  createSolanaRpcApi,
  DEFAULT_RPC_CONFIG,
  Rpc,
  SolanaRpcApi,
} from "@solana/kit";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  AccountMeta,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import BN from "bn.js";

export interface KaminoVaultReserves {
  vaultReservesAccountMetas: Array<{
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  vaultReservesLendingMarkets: Array<{
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  maxAllocatedReserve: {
    reserve: PublicKey;
    lendingMarket: PublicKey;
  };
}

export const getVaultReserves = async (
  rpc: Rpc<SolanaRpcApi>,
  vaultState: VaultState
) => {
  const vaultAllocations = vaultState.vaultAllocationStrategy.filter(
    (vaultAllocation) =>
      !new PublicKey(vaultAllocation.reserve).equals(PublicKey.default)
  );

  const vaultReserves = vaultAllocations.map(
    (allocation) => allocation.reserve
  );

  const reserveAccounts = await rpc
    .getMultipleAccounts(vaultReserves, {
      commitment: "processed",
    })
    .send();

  const deserializedReserves = reserveAccounts.value.map((reserve, i) => {
    if (reserve === null) {
      // maybe reuse old here
      throw new Error(`Reserve account ${vaultReserves[i]} was not found`);
    }
    const reserveAccount = Reserve.decode(
      Buffer.from(reserve.data[0], "base64")
    );
    if (!reserveAccount) {
      throw Error(`Could not parse reserve ${vaultReserves[i]}`);
    }
    return reserveAccount;
  });

  const reservesAndOracles = await getTokenOracleData(
    rpc,
    deserializedReserves
  );

  const kaminoReserves = new Map<Address, KaminoReserve>();
  let slotDuration = 400;
  try {
    slotDuration = await getMedianSlotDurationInMsFromLastEpochs();
  } catch (error) {
    console.error(
      "Error getting median slot duration in ms from last epochs:",
      error
    );
  }

  reservesAndOracles.forEach(([reserve, oracle], index) => {
    if (!oracle) {
      throw Error(
        `Could not find oracle for ${parseTokenSymbol(
          reserve.config.tokenInfo.name
        )} reserve`
      );
    }
    const kaminoReserve = KaminoReserve.initialize(
      vaultReserves[index],
      reserve,
      oracle,
      rpc,
      slotDuration
    );
    kaminoReserves.set(kaminoReserve.address, kaminoReserve);
  });

  let vaultReservesAccountMetas: AccountMeta[] = [];
  let vaultReservesLendingMarkets: AccountMeta[] = [];
  vaultReserves.forEach((reserve) => {
    const reserveState = kaminoReserves.get(reserve);
    if (reserveState === undefined) {
      throw new Error(`Reserve ${reserve.toString()} not found`);
    }
    vaultReservesAccountMetas = vaultReservesAccountMetas.concat([
      { pubkey: new PublicKey(reserve), isSigner: false, isWritable: true },
    ]);
    vaultReservesLendingMarkets = vaultReservesLendingMarkets.concat([
      {
        pubkey: new PublicKey(reserveState.state.lendingMarket),
        isSigner: false,
        isWritable: false,
      },
    ]);
  });

  let maxAllocatedReserve: Address = address(PublicKey.default.toString());
  let maxAllocated: BN = new BN(0);

  vaultAllocations.forEach((allocation) => {
    if (allocation.targetAllocationWeight.gt(maxAllocated)) {
      maxAllocated = allocation.targetAllocationWeight;
      maxAllocatedReserve = allocation.reserve;
    }
  });

  const maxAllocatedLendingMarket =
    kaminoReserves.get(maxAllocatedReserve)?.state.lendingMarket;
  if (!maxAllocatedLendingMarket) {
    throw new Error(`Reserve ${maxAllocatedReserve} not found`);
  }

  return {
    vaultReservesAccountMetas,
    vaultReservesLendingMarkets,
    maxAllocatedReserve: {
      reserve: new PublicKey(maxAllocatedReserve),
      lendingMarket: new PublicKey(maxAllocatedLendingMarket),
    },
  };
};

export const getKaminoVaultWithdrawAccounts = async (kvault: PublicKey) => {
  // Derive required accounts
  const [sharesMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("shares"), kvault.toBuffer()],
    new PublicKey(KVAULTS_PROGRAM_ID)
  );

  const [tokenVault] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), kvault.toBuffer()],
    new PublicKey(KVAULTS_PROGRAM_ID)
  );

  const [baseVaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority"), kvault.toBuffer()],
    new PublicKey(KVAULTS_PROGRAM_ID)
  );

  const [eventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    new PublicKey(KVAULTS_PROGRAM_ID)
  );

  return {
    sharesMint,
    tokenVault,
    baseVaultAuthority,
    eventAuthority,
  };
};

export const buildKaminoDirectWithdrawRemainingAccounts = async (
  lookupTableAddresses: PublicKey[],
  kvault: PublicKey,
  vaultAssetMint: PublicKey,
  sharesMint: PublicKey,
  vaultStrategySharesAta: PublicKey,
  tokenVault: PublicKey,
  baseVaultAuthority: PublicKey,
  eventAuthority: PublicKey
) => {
  const api = createSolanaRpcApi<SolanaRpcApi>({
    ...DEFAULT_RPC_CONFIG,
    defaultCommitment: "processed",
  });
  const rpc = createRpc({
    api,
    transport: createDefaultRpcTransport({
      url: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    }),
  });
  const kaminoVault = new KaminoVault(address(kvault.toBase58()));
  const vaultState = await kaminoVault.getState(rpc);
  lookupTableAddresses.push(new PublicKey(vaultState.vaultLookupTable));

  const {
    vaultReservesAccountMetas,
    vaultReservesLendingMarkets,
    maxAllocatedReserve,
  } = await getVaultReserves(rpc, vaultState);
  const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("lma"), maxAllocatedReserve.lendingMarket.toBuffer()],
    new PublicKey(DEFAULT_KLEND_PROGRAM_ID)
  );

  const [reserveLiquiditySupply] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reserve_liq_supply"),
      maxAllocatedReserve.lendingMarket.toBuffer(),
      vaultAssetMint.toBuffer(),
    ],
    new PublicKey(DEFAULT_KLEND_PROGRAM_ID)
  );

  const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("reserve_coll_mint"),
      maxAllocatedReserve.lendingMarket.toBuffer(),
      vaultAssetMint.toBuffer(),
    ],
    new PublicKey(DEFAULT_KLEND_PROGRAM_ID)
  );

  const [ctokenVault] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("ctoken_vault"),
      kvault.toBuffer(),
      maxAllocatedReserve.reserve.toBuffer(),
    ],
    new PublicKey(KVAULTS_PROGRAM_ID)
  );
  return [
    { pubkey: kvault, isSigner: false, isWritable: true },
    { pubkey: tokenVault, isSigner: false, isWritable: true },
    { pubkey: baseVaultAuthority, isSigner: false, isWritable: false },
    { pubkey: sharesMint, isSigner: false, isWritable: true },
    { pubkey: vaultStrategySharesAta, isSigner: false, isWritable: true },
    { pubkey: maxAllocatedReserve.reserve, isSigner: false, isWritable: true },
    { pubkey: ctokenVault, isSigner: false, isWritable: true },
    {
      pubkey: maxAllocatedReserve.lendingMarket,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
    { pubkey: reserveLiquiditySupply, isSigner: false, isWritable: true },
    { pubkey: reserveCollateralMint, isSigner: false, isWritable: true },
    { pubkey: eventAuthority, isSigner: false, isWritable: false },
    {
      pubkey: new PublicKey(DEFAULT_KLEND_PROGRAM_ID),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey(KVAULTS_PROGRAM_ID),
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
    ...vaultReservesAccountMetas,
    ...vaultReservesLendingMarkets,
  ];
};
