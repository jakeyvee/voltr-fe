import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params: { pubkey } }: { params: { pubkey: string } }
) {
  try {
    const startUnixTs = request.nextUrl.searchParams.get("startTs");
    const endUnixTs = request.nextUrl.searchParams.get("endTs");
    const pStartUtcSeconds = startUnixTs ? parseInt(startUnixTs) : 0;
    const pEndUtcSeconds = endUnixTs ? parseInt(endUnixTs) : Date.now() / 1000;
    
    const { data, error } = await supabaseAdmin
      .rpc("calculate_fee_earned_in_lp", {
        p_vault_pk: pubkey,
        p_start_epoch: pStartUtcSeconds,
        p_end_epoch: pEndUtcSeconds,
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

    return NextResponse.json({
      success: true,
      data: {
        feeEarnedInLp: data,
      },
    });
  } catch (error) {
    console.error("Error fetching fee earned in lp:", error);
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
