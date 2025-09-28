import { supabaseAdmin } from "@/lib/supabase";
import {
  fetchExternalVaults,
  getExternalVaultPythFeedIds,
  updateExternalVaultPrices,
} from "@/lib/externalVaultService";
import { NextResponse } from "next/server";

export const revalidate = 0;

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

    const externalVaults = await fetchExternalVaults();

    const pythFeedIds = new Set([
      ...vaults.map((vault) => vault.asset.pythFeedId),
      ...getExternalVaultPythFeedIds(),
    ]);

    const pythPriceDataMap = new Map<string, number>();
    for (const pythFeedId of Array.from(pythFeedIds)) {
      try {
        const pythPriceResponse = await fetch(
          `https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=${pythFeedId}`
        );

        if (pythPriceResponse.ok) {
          const pythPriceData = await pythPriceResponse.json();
          const pythPriceParsed = pythPriceData.parsed[0];
          const pythPrice =
            pythPriceParsed.price.price *
            Math.pow(10, pythPriceParsed.price.expo);
          pythPriceDataMap.set(pythFeedId, pythPrice);
        }
      } catch (error) {
        console.error(`Error fetching Pyth price for ${pythFeedId}:`, error);
      }
    }

    const processedVaults = vaults.map((vault) => ({
      ...vault,
      asset: {
        ...vault.asset,
        price:
          pythPriceDataMap.get(vault.asset.pythFeedId) || vault.asset.price,
      },
    }));

    const updatedExternalVaults = updateExternalVaultPrices(
      externalVaults,
      pythPriceDataMap
    );

    const allVaults = [...processedVaults, ...updatedExternalVaults];

    return NextResponse.json({
      success: true,
      vaults: allVaults,
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
