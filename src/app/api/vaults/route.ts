import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { data: vaults, error } = await supabaseAdmin
      .rpc("get_vaults_information")
      .select("*");

    if (error) throw error;

    if (!vaults) {
      return NextResponse.json(
        {
          success: false,
          error: "No data found",
        },
        { status: 404 }
      );
    }

    const pythFeedIds = new Set(vaults.map((vault) => vault.asset.pythFeedId));

    const pythPriceDataMap = new Map<string, number>();

    for (const pythFeedId of Array.from(pythFeedIds)) {
      const pythPriceResponse = await fetch(
        `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythFeedId}`
      );
      const pythPriceData = await pythPriceResponse.json();
      const pythPriceParsed = pythPriceData.parsed[0];
      const pythPrice =
        pythPriceParsed.price.price * Math.pow(10, pythPriceParsed.price.expo);
      pythPriceDataMap.set(pythFeedId, pythPrice);
    }

    return NextResponse.json({
      success: true,
      vaults: vaults.map((vault) => ({
        ...vault,
        asset: {
          ...vault.asset,
          price: pythPriceDataMap.get(vault.asset.pythFeedId),
        },
      })),
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
