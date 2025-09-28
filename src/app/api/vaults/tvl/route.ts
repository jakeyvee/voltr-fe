import { supabaseAdmin } from "@/lib/supabase";
import {
  fetchExternalVaults,
  getExternalVaultPythFeedIds,
} from "@/lib/externalVaultService";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Fetch internal vaults TVL data
    const { data: vaultTvlData, error } = await supabaseAdmin
      .rpc("get_total_tvl_usd")
      .select("*");

    if (error) throw error;

    // Fetch external vaults (Kamino)
    const externalVaults = await fetchExternalVaults();

    // Collect all Pyth feed IDs
    const pythFeedIds = new Set([
      ...(vaultTvlData || []).map((vault) => vault.pyth_feed_id),
      ...getExternalVaultPythFeedIds(),
    ]);

    // Fetch all Pyth prices in parallel
    const pythPriceDataMap = new Map<string, number>();
    const pricePromises = Array.from(pythFeedIds).map(async (pythFeedId) => {
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
    });

    await Promise.all(pricePromises);

    let totalTvlUsd = 0;
    const assetMap = new Map<
      string,
      {
        asset: string;
        tvl: number;
        price: number;
        tvlUsd: number;
      }
    >();

    // Calculate USD value for internal vaults
    if (vaultTvlData) {
      for (const vault of vaultTvlData) {
        const price = pythPriceDataMap.get(vault.pyth_feed_id) || 0;
        const tvlNumber = parseFloat(vault.total_tvl.toString());
        const adjustedTvl = tvlNumber / Math.pow(10, vault.asset_decimals);
        const tvlUsd = adjustedTvl * price;

        totalTvlUsd += tvlUsd;

        const existing = assetMap.get(vault.asset_symbol);
        if (existing) {
          existing.tvl += adjustedTvl;
          existing.tvlUsd += tvlUsd;
        } else {
          assetMap.set(vault.asset_symbol, {
            asset: vault.asset_symbol,
            tvl: adjustedTvl,
            price: price,
            tvlUsd: tvlUsd,
          });
        }
      }
    }

    // Calculate USD value for external vaults (Kamino)
    for (const externalVault of externalVaults) {
      const price = pythPriceDataMap.get(externalVault.asset.pythFeedId) || 0;
      const adjustedTvl =
        externalVault.tvl / Math.pow(10, externalVault.asset.decimals);
      const tvlUsd = adjustedTvl * price;

      totalTvlUsd += tvlUsd;

      const existing = assetMap.get(externalVault.asset.name);
      if (existing) {
        existing.tvl += adjustedTvl;
        existing.tvlUsd += tvlUsd;
      } else {
        assetMap.set(externalVault.asset.name, {
          asset: externalVault.asset.name,
          tvl: adjustedTvl,
          price: price,
          tvlUsd: tvlUsd,
        });
      }
    }

    const breakdown = Array.from(assetMap.values()).sort(
      (a, b) => b.tvlUsd - a.tvlUsd
    );

    return NextResponse.json({
      success: true,
      data: {
        totalTvlUsd: Math.round(totalTvlUsd * 100) / 100, // Round to 2 decimal places
        breakdown: breakdown, // Now grouped by asset
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error calculating total TVL USD:", error);
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
