import { DRIFT_PROGRAM_ID, DriftClient, Wallet } from "@drift-labs/sdk";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { DRIFT_SPOT_STATE } from "./DirectWithdrawalConstants";
import { Keypair } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

export const getDriftEarnWithdrawAccounts = async (
  subAccountId: number,
  strategyAuth: PublicKey
) => {
  const [driftSigner] = PublicKey.findProgramAddressSync(
    [Buffer.from("drift_signer")],
    new PublicKey(DRIFT_PROGRAM_ID)
  );

  const [userStats] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_stats"), strategyAuth.toBuffer()],
    new PublicKey(DRIFT_PROGRAM_ID)
  );

  const [user] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      strategyAuth.toBuffer(),
      new BN(subAccountId).toArrayLike(Buffer, "le", 2),
    ],
    new PublicKey(DRIFT_PROGRAM_ID)
  );

  return {
    driftSigner,
    userStats,
    user,
  };
};

export const buildDriftDirectWithdrawRemainingAccounts = async (
  connection: Connection,
  strategyAuth: PublicKey,
  strategy: PublicKey,
  driftSigner: PublicKey,
  userStats: PublicKey,
  user: PublicKey,
  marketIndex: number
) => {
  const remainingAccounts = [
    { pubkey: driftSigner, isSigner: false, isWritable: true },
    { pubkey: strategy, isSigner: false, isWritable: true },
    {
      pubkey: new PublicKey(DRIFT_PROGRAM_ID),
      isSigner: false,
      isWritable: false,
    },
    { pubkey: userStats, isSigner: false, isWritable: true },
    { pubkey: user, isSigner: false, isWritable: true },
    { pubkey: DRIFT_SPOT_STATE, isSigner: false, isWritable: false },
  ];

  const driftClient = new DriftClient({
    connection,
    wallet: new Wallet(Keypair.generate()),
    env: "mainnet-beta",
    skipLoadUsers: true,
  });

  await driftClient.subscribe();

  const userAccounts = await driftClient.getUserAccountsForAuthority(
    strategyAuth
  );

  remainingAccounts.push(
    ...driftClient.getRemainingAccounts({
      userAccounts,
      useMarketLastSlotCache: false,
      writableSpotMarketIndexes: [marketIndex],
    })
  );

  await driftClient.unsubscribe();

  return remainingAccounts;
};
