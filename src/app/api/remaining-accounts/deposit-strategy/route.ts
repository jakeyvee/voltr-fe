// app/api/remaining-accounts/route.ts
import { NextResponse } from "next/server";
import { PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { VoltrClient } from "@voltr/sdk";
import { createConnection } from "@/lib/Connection";

// Constants
const DRIFT_PROGRAM = new PublicKey(
  "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"
);
const KLEND_PROGRAM = new PublicKey(
  "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD"
);
const SOLEND_PROGRAM = new PublicKey(
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"
);
const MARGINFI_PROGRAM = new PublicKey(
  "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA"
);
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Type for remaining account
type RemainingAccount = {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
};

// Strategy handlers
const strategyHandlers = {
  drift: (vaultAssetIdleAuth: PublicKey): RemainingAccount[] => {
    const state = new PublicKey("5zpq7DvB6UdFFvpmBPspGPNfUGoBRRCE2HHg5u3gxcsN");
    const [user] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user"),
        vaultAssetIdleAuth.toBuffer(),
        new BN(0).toArrayLike(Buffer, "le", 2),
      ],
      DRIFT_PROGRAM
    );
    const [userStats] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_stats"), vaultAssetIdleAuth.toBuffer()],
      DRIFT_PROGRAM
    );
    const oracle = new PublicKey(
      "En8hkHLkRe9d9DraYmBTrus518BvmVH448YcvmrFM6Ce"
    );
    const [spotMarket] = PublicKey.findProgramAddressSync(
      [Buffer.from("spot_market"), new BN(0).toArrayLike(Buffer, "le", 2)],
      DRIFT_PROGRAM
    );

    return [
      { pubkey: state.toString(), isSigner: false, isWritable: false },
      { pubkey: user.toString(), isSigner: false, isWritable: true },
      { pubkey: userStats.toString(), isSigner: false, isWritable: true },
      { pubkey: oracle.toString(), isSigner: false, isWritable: false },
      { pubkey: spotMarket.toString(), isSigner: false, isWritable: true },
    ];
  },

  kamino: (vaultAssetIdleAuth: PublicKey): RemainingAccount[] => {
    const lendingMarket = new PublicKey(
      "ByYiZxp8QrdN9qbdtaAiePN8AAr3qvTPppNJDpf5DVJ5"
    );
    const [lendingMarketAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("lma"), lendingMarket.toBuffer()],
      KLEND_PROGRAM
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
      KLEND_PROGRAM
    );
    const userDestinationCollateral = getAssociatedTokenAddressSync(
      reserveCollateralMint,
      vaultAssetIdleAuth,
      true
    );
    const scopePrices = new PublicKey(
      "3NJYftD5sjVfxSnUdZ1wVML8f3aC6mp1CXCL6L7TnU8C"
    );

    return [
      { pubkey: lendingMarket.toString(), isSigner: false, isWritable: false },
      {
        pubkey: lendingMarketAuthority.toString(),
        isSigner: false,
        isWritable: true,
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
    ];
  },

  solend: (vaultAssetIdleAuth: PublicKey): RemainingAccount[] => {
    const collateralMint = new PublicKey(
      "993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk"
    );
    const vaultCollateralAta = getAssociatedTokenAddressSync(
      collateralMint,
      vaultAssetIdleAuth,
      true
    );
    const solendReserve = new PublicKey(
      "BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw"
    );
    const solendLendingMarket = new PublicKey(
      "4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY"
    );
    const [solendLendingMarketAuthority] = PublicKey.findProgramAddressSync(
      [solendLendingMarket.toBytes()],
      SOLEND_PROGRAM
    );
    const pythOracle = new PublicKey(
      "Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"
    );
    const switchboardOracle = new PublicKey(
      "BjUgj6YCnFBZ49wF54ddBVA9qu8TeqkFtkbqmZcee8uW"
    );

    return [
      {
        pubkey: vaultCollateralAta.toString(),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: solendReserve.toString(), isSigner: false, isWritable: true },
      { pubkey: collateralMint.toString(), isSigner: false, isWritable: true },
      {
        pubkey: solendLendingMarket.toString(),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: solendLendingMarketAuthority.toString(),
        isSigner: false,
        isWritable: false,
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
    ];
  },

  marginfi: (vaultAssetIdleAuth: PublicKey): RemainingAccount[] => {
    const marginfiGroup = new PublicKey(
      "4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8"
    );
    const marginfiAccount = new PublicKey(
      "67c9pk468iWVju9HrriDCFJw5DGn7n3Vv2sPjRFLQcuG"
    );
    const bank = new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB");

    return [
      { pubkey: marginfiGroup.toString(), isSigner: false, isWritable: true },
      { pubkey: marginfiAccount.toString(), isSigner: false, isWritable: true },
      { pubkey: bank.toString(), isSigner: false, isWritable: true },
    ];
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const strategy = searchParams.get("strategy");
    const vault = searchParams.get("vault");

    if (!strategy || !vault) {
      return NextResponse.json(
        { success: false, error: "Missing strategy or vaultAssetIdleAuth" },
        { status: 400 }
      );
    }

    const conn = createConnection();
    const vc = new VoltrClient(conn);
    const { vaultAssetIdleAuth } = vc.findVaultAddresses(new PublicKey(vault));
    // Convert string to PublicKey
    const vaultAssetIdleAuthPubkey = new PublicKey(vaultAssetIdleAuth);

    // Get strategy identifier (drift, kamino, solend, or marginfi)
    const strategyPubkey = new PublicKey(strategy);

    // Map strategy pubkey to handler
    const strategyMap = {
      "3sDgRMuea6rhV1NVyzuCxQE9eVzSs1jWGaLyRL2tg7nK": "kamino",
      "2gHVReRR6kqBDpFsgArKW458CKb1zuHiBSPxtTPkAd54": "drift",
      "876jRjsvyA3pVCRcztWbZyqLCZ7GQwgjSfcUcWb6tenQ": "solend",
      "5Mo2y7XRfAd1JLUeqZED4mcHTDznEMmdwBWscv1Nr13Q": "marginfi",
    } as const;

    const strategyType = strategyMap[
      strategy as keyof typeof strategyMap
    ] as keyof typeof strategyHandlers;

    if (!strategyType) {
      return NextResponse.json(
        { success: false, error: "Invalid strategy address" },
        { status: 400 }
      );
    }

    // Get remaining accounts
    const remainingAccounts = strategyHandlers[strategyType](
      vaultAssetIdleAuthPubkey
    );

    return NextResponse.json({
      success: true,
      data: remainingAccounts,
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
