import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params: { pubkey } }: { params: { pubkey: string } }
) {
  try {
    const unixTs = request.nextUrl.searchParams.get("ts");
    const utcSecondsNow = Math.floor(Date.now() / 1000);
    const pUtcSeconds = unixTs ? parseInt(unixTs) : utcSecondsNow;

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

    const sharePrice = (data as any).share_price;
    const totalValue = (data as any).total_value;

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
