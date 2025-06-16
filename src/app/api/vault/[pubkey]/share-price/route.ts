import { createConnection } from "@/lib/publicConnection";
import { supabaseAdmin } from "@/lib/supabase";
import { PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params: { pubkey } }: { params: { pubkey: string } }
) {
  try {
    const unixTs = request.nextUrl.searchParams.get("ts");
    const pUtcSeconds = unixTs
      ? parseInt(unixTs)
      : Math.floor(Date.now() / 1000);

    const { data, error } = await supabaseAdmin
      .rpc("get_interpolated_share_price", {
        p_vault_pk: pubkey,
        p_utc_seconds: pUtcSeconds,
      })
      .select("*");

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "No data found",
        },
        { status: 404 }
      );
    }

    let sharePrice = (data as any).share_price;
    let totalValue = (data as any).total_value;
    let interpolated = (data as any).is_interpolated;

    if (!interpolated) {
      const connection = createConnection();
      const vc = new VoltrClient(connection);

      const vaultAccount = await vc.fetchVaultAccount(new PublicKey(pubkey));
      const multiplier = vaultAccount.asset.totalValue.toNumber() / totalValue;
      totalValue = vaultAccount.asset.totalValue.toNumber();
      sharePrice = sharePrice * multiplier;
    }
    return NextResponse.json({
      success: true,
      data: {
        sharePrice,
        totalValue,
      },
    });
  } catch (error) {
    console.error("Error fetching vaults information:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
