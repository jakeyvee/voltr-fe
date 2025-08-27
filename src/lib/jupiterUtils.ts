import { PublicKey } from "@solana/web3.js";
import {
  JUPITER_LEND_PROGRAM_ID,
  JUPITER_LIQUIDITY_PROGRAM_ID,
  JUPITER_REWARDS_RATE_PROGRAM_ID,
} from "./DirectWithdrawalConstants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

export const getJupiterVaultWithdrawAccounts = (
  lending: PublicKey,
  assetMint: PublicKey,
  assetTokenProgram: PublicKey
) => {
  const [fTokenMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("f_token_mint"), assetMint.toBuffer()],
    new PublicKey(JUPITER_LEND_PROGRAM_ID)
  );

  const [lendingAdmin] = PublicKey.findProgramAddressSync(
    [Buffer.from("lending_admin")],
    new PublicKey(JUPITER_LEND_PROGRAM_ID)
  );

  const [supplyTokenReservesLiquidity] = PublicKey.findProgramAddressSync(
    [Buffer.from("reserve"), assetMint.toBuffer()],
    new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID)
  );

  const [rateModel] = PublicKey.findProgramAddressSync(
    [Buffer.from("rate_model"), assetMint.toBuffer()],
    new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID)
  );

  const [userClaim] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_claim"), lendingAdmin.toBuffer(), assetMint.toBuffer()],
    new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID)
  );

  const [liquidity] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID)
  );

  const [rewardsRateModel] = PublicKey.findProgramAddressSync(
    [Buffer.from("lending_rewards_rate_model"), assetMint.toBuffer()],
    new PublicKey(JUPITER_REWARDS_RATE_PROGRAM_ID)
  );

  const [lendingSupplyPositionOnLiquidity] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user_supply_position"),
      assetMint.toBuffer(),
      lending.toBuffer(),
    ],
    new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID)
  );

  const jVault = getAssociatedTokenAddressSync(
    assetMint,
    liquidity,
    true,
    assetTokenProgram
  );

  return {
    fTokenMint,
    lendingAdmin,
    supplyTokenReservesLiquidity,
    rateModel,
    userClaim,
    liquidity,
    rewardsRateModel,
    lendingSupplyPositionOnLiquidity,
    jVault,
  };
};

export const buildJupiterDirectWithdrawRemainingAccounts = async (
  lending: PublicKey,
  vaultStrategyFTokenAta: PublicKey,
  lendingAdmin: PublicKey,
  fTokenMint: PublicKey,
  supplyTokenReservesLiquidity: PublicKey,
  rateModel: PublicKey,
  userClaim: PublicKey,
  liquidity: PublicKey,
  rewardsRateModel: PublicKey,
  lendingSupplyPositionOnLiquidity: PublicKey,
  jVault: PublicKey
) => {
  return [
    { pubkey: lending, isSigner: false, isWritable: true },
    { pubkey: vaultStrategyFTokenAta, isSigner: false, isWritable: true },
    { pubkey: lendingAdmin, isSigner: false, isWritable: false },
    { pubkey: fTokenMint, isSigner: false, isWritable: true },
    { pubkey: supplyTokenReservesLiquidity, isSigner: false, isWritable: true },
    {
      pubkey: lendingSupplyPositionOnLiquidity,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: rateModel, isSigner: false, isWritable: false },
    { pubkey: jVault, isSigner: false, isWritable: true },
    { pubkey: userClaim, isSigner: false, isWritable: true },
    { pubkey: liquidity, isSigner: false, isWritable: true },
    {
      pubkey: new PublicKey(JUPITER_LIQUIDITY_PROGRAM_ID),
      isSigner: false,
      isWritable: true,
    },
    { pubkey: rewardsRateModel, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: true },
    {
      pubkey: new PublicKey(JUPITER_LEND_PROGRAM_ID),
      isSigner: false,
      isWritable: true,
    },
  ];
};
