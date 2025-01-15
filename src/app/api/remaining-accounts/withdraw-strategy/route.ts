import { NextResponse } from "next/server";
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createConnection } from "@/lib/Connection";
import { VoltrClient } from "@voltr/vault-sdk";

export const usdcMarketsKeys = {
  drift: {
    program: new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"),
    liquidityReserve: new PublicKey(
      "GXWqPpjQpdz7KZw9p7f5PX2eGxHAhvpNXiviFkAB8zXg"
    ),
    liquidityReserveAuth: new PublicKey(
      "JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw"
    ),
  },
  kamino: {
    program: new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD"),
    liquidityReserve: new PublicKey(
      "HTyrXvSvBbD7WstvU3oqFTBZM1fPZJPxVRvwLAmCTDyJ"
    ),
    liquidityReserveAuth: new PublicKey(
      "81BgcfZuZf9bESLvw3zDkh7cZmMtDwTPgkCvYu7zx26o"
    ),
  },
  solend: {
    program: new PublicKey("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"),
    liquidityReserve: new PublicKey(
      "8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf"
    ),
    liquidityReserveAuth: new PublicKey(
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
  },
  marginfi: {
    program: new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB"),
    liquidityReserve: new PublicKey(
      "7jaiZR5Sk8hdYN9MxTpczTcwbWpb5WEoxSANuUwveuat"
    ),
    liquidityReserveAuth: new PublicKey(
      "3uxNepDbmkDNq6JhRja5Z8QwbTrfmkKP8AKZV5chYDGG"
    ),
  },
};

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Updated types
type RemainingAccount = {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
};

type StrategyResponse = {
  instructionDiscriminator: number[] | null;
  additionalArgs: number[] | null;
  remainingAccounts: RemainingAccount[] | null;
};

// Strategy handlers remain the same...
const strategyHandlers = {
  drift: (vaultStrategyAuth: PublicKey): StrategyResponse => {
    const state = new PublicKey("5zpq7DvB6UdFFvpmBPspGPNfUGoBRRCE2HHg5u3gxcsN");
    const [user] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user"),
        vaultStrategyAuth.toBuffer(),
        new BN(0).toArrayLike(Buffer, "le", 2),
      ],
      usdcMarketsKeys.drift.program
    );
    const [userStats] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_stats"), vaultStrategyAuth.toBuffer()],
      usdcMarketsKeys.drift.program
    );
    const oracle = new PublicKey(
      "En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"
    );
    const [spotMarket] = PublicKey.findProgramAddressSync(
      [Buffer.from("spot_market"), new BN(0).toArrayLike(Buffer, "le", 2)],
      usdcMarketsKeys.drift.program
    );

    return {
      instructionDiscriminator: null,
      additionalArgs: [0, 0],
      remainingAccounts: [
        {
          pubkey: usdcMarketsKeys.drift.liquidityReserveAuth.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.drift.liquidityReserve.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.drift.program.toString(),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: state.toString(), isSigner: false, isWritable: false },
        { pubkey: user.toString(), isSigner: false, isWritable: true },
        { pubkey: userStats.toString(), isSigner: false, isWritable: true },
        { pubkey: oracle.toString(), isSigner: false, isWritable: false },
        { pubkey: spotMarket.toString(), isSigner: false, isWritable: true },
      ],
    };
  },

  kamino: (vaultStrategyAuth: PublicKey): StrategyResponse => {
    const lendingMarket = new PublicKey(
      "ByYiZxp8QrdN9qbdtaAiePN8AAr3qvTPppNJDpf5DVJ5"
    );
    const reserve = new PublicKey(
      "9TD2TSv4pENb8VwfbVYg25jvym7HN6iuAR6pFNSrKjqQ"
    );
    const [reserveCollateralMint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reserve_coll_mint"),
        lendingMarket.toBuffer(),
        USDC_MINT.toBuffer(),
      ],
      usdcMarketsKeys.kamino.program
    );
    const userDestinationCollateral = getAssociatedTokenAddressSync(
      reserveCollateralMint,
      vaultStrategyAuth,
      true
    );
    const scopePrices = new PublicKey(
      "3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C"
    );

    return {
      instructionDiscriminator: null,
      additionalArgs: null,
      remainingAccounts: [
        {
          pubkey: usdcMarketsKeys.kamino.liquidityReserveAuth.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.kamino.liquidityReserve.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.kamino.program.toString(),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: lendingMarket.toString(),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: reserve.toString(), isSigner: false, isWritable: true },
        {
          pubkey: reserveCollateralMint.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userDestinationCollateral.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: TOKEN_PROGRAM_ID.toString(),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSVAR_INSTRUCTIONS_PUBKEY.toString(),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: scopePrices.toString(), isSigner: false, isWritable: false },
      ],
    };
  },

  solend: (vaultStrategyAuth: PublicKey): StrategyResponse => {
    const collateralMint = new PublicKey(
      "993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk"
    );
    const vaultCollateralAta = getAssociatedTokenAddressSync(
      collateralMint,
      vaultStrategyAuth,
      true
    );
    const solendReserve = new PublicKey(
      "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw"
    );
    const solendLendingMarket = new PublicKey(
      "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY"
    );
    const pythOracle = new PublicKey(
      "Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"
    );
    const switchboardOracle = new PublicKey(
      "BjUgj6YCnFBZ49wF54ddBVA9qu8TeqkFtkbqmZcee8uW"
    );

    return {
      instructionDiscriminator: null,
      additionalArgs: null,
      remainingAccounts: [
        {
          pubkey: usdcMarketsKeys.solend.liquidityReserveAuth.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.solend.liquidityReserve.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.solend.program.toString(),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: vaultCollateralAta.toString(),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: solendReserve.toString(), isSigner: false, isWritable: true },
        {
          pubkey: collateralMint.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: solendLendingMarket.toString(),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: pythOracle.toString(), isSigner: false, isWritable: false },
        {
          pubkey: switchboardOracle.toString(),
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: TOKEN_PROGRAM_ID.toString(),
          isSigner: false,
          isWritable: false,
        },
      ],
    };
  },

  marginfi: (vaultStrategyAuth: PublicKey): StrategyResponse => {
    const marginfiGroup = new PublicKey(
      "4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8"
    );

    // TODO: find out user's marginfiAccount
    const marginfiAccount = new PublicKey(
      "6aHMzzqopSsZaTXhkZLbKy33o28hQpPYrqTvjN54PfnP"
    );
    const bank = new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB");
    const oracle = new PublicKey(
      "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"
    );

    return {
      instructionDiscriminator: null,
      additionalArgs: null,
      remainingAccounts: [
        {
          pubkey: usdcMarketsKeys.marginfi.liquidityReserve.toString(),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: usdcMarketsKeys.marginfi.program.toString(),
          isSigner: false,
          isWritable: false,
        },
        { pubkey: marginfiGroup.toString(), isSigner: false, isWritable: true },
        {
          pubkey: marginfiAccount.toString(),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: bank.toString(), isSigner: false, isWritable: true },
        { pubkey: oracle.toString(), isSigner: false, isWritable: false },
      ],
    };
  },
};

// Strategy map remains the same...
const strategyMap = {
  HtHYn3juNQe7B4xXe2mi9x5xcfUHZrsw3gKE78cQypys: "kamino",
  GGf8eUHvTX3CLC3HubPpMxm8iqHKheR6ZEK1QAyozv5j: "drift",
  "4i9kzGr1UkxBCCUkQUQ4vsF51fjdt2knKxrwM1h1NW4g": "solend",
  "4JHtgXyMb9gFJ1hGd2sh645jrZcxurSG3QP7Le3aTMTx": "marginfi",
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strategy = searchParams.get("strategy");
    const vault = searchParams.get("vault");

    if (!strategy || !vault) {
      return NextResponse.json(
        { success: false, error: "Missing strategy or vault" },
        { status: 400 }
      );
    }

    const conn = createConnection();
    const vc = new VoltrClient(conn);
    const vaultStrategyAuth = vc.findVaultStrategyAuth(
      new PublicKey(vault),
      new PublicKey(strategy)
    );

    const strategyType = strategyMap[
      strategy as keyof typeof strategyMap
    ] as keyof typeof strategyHandlers;

    if (!strategyType) {
      return NextResponse.json(
        { success: false, error: "Invalid strategy address" },
        { status: 400 }
      );
    }

    // Get strategy response
    const response = strategyHandlers[strategyType](vaultStrategyAuth);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 400 }
    );
  }
}
