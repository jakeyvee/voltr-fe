import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params: { pubkey } }: { params: { pubkey: string } }
) {
  try {
    const { data: vault, error } = await supabaseAdmin
      .rpc("get_vault_information", {
        vault_pubkey: pubkey,
      })
      .select("*");

    if (error) throw error;

    if (!vault) {
      return NextResponse.json(
        {
          success: false,
          error: "No data found",
        },
        { status: 404 }
      );
    }

    const pythFeedId = (vault as any).token.pythFeedId;
    const pythPriceResponse = await fetch(
      `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythFeedId}`
    );
    const pythPriceData = await pythPriceResponse.json();
    const pythPriceParsed = pythPriceData.parsed[0];
    const pythPrice =
      pythPriceParsed.price.price * Math.pow(10, pythPriceParsed.price.expo);

    const vaultInformation = {
      ...vault,
      token: {
        ...(vault as any).token,
        price: pythPrice,
      },
    };

    return NextResponse.json({
      success: true,
      vault: vaultInformation,
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
