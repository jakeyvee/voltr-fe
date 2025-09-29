export interface ExternalVaultConfig {
  pubkey: string;
  name: string;
  theme: string;
  org: {
    name: string;
    icon: string;
  };
  asset: {
    name: string;
    icon: string;
    decimals: number;
    pythFeedId: string;
  };
  allocations: Array<{
    orgName: string;
    orgIcon: string;
  }>;
  age: number;
  capacity: number;
}

export interface KaminoMetrics {
  apy7d: string;
  apy24h: string;
  apy30d: string;
  apy90d: string;
  apy180d: string;
  apy365d: string;
  tokenPrice: string;
  tokensAvailable: string;
  tokensInvested: string;
  apy: string;
}

export interface ProcessedExternalVault extends ExternalVaultConfig {
  tvl: number;
  apy: number;
  asset: ExternalVaultConfig["asset"] & {
    price: number;
  };
}

const EXTERNAL_VAULTS: ExternalVaultConfig[] = [
  {
    pubkey: "A3hTCWdnfV6uiQLxRmnv17EpiEtmc93v1AGQnWy44Mup",
    name: "Elemental USDC Turbo",
    theme: "Lending",
    org: {
      name: "Elemental Fund",
      icon: "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/elemental-2Q0wUh3ZlHR2zA69A8bOkkZkxotdQt.jpg",
    },
    asset: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      decimals: 6,
      pythFeedId:
        "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    },
    allocations: [
      {
        orgName: "Kamino",
        orgIcon:
          "https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/KMNO%20Token%20PNG-zlG8IWuvvfkyGlCEgVahCe8FZKo1xi.png",
      },
    ],
    age: Number.MAX_SAFE_INTEGER,
    capacity: Number.MAX_SAFE_INTEGER,
  },
];

/**
 * Fetches metrics data from Kamino API
 */
async function fetchKaminoMetrics(
  pubkey: string
): Promise<KaminoMetrics | null> {
  try {
    const response = await fetch(
      `https://api.kamino.finance/kvaults/${pubkey}/metrics`,
      {
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch Kamino metrics for ${pubkey}: ${response.status}`
      );
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Kamino metrics for ${pubkey}:`, error);
    return null;
  }
}

async function processExternalVault(
  config: ExternalVaultConfig
): Promise<ProcessedExternalVault | null> {
  const metrics = await fetchKaminoMetrics(config.pubkey);

  if (!metrics) {
    return null;
  }

  return {
    ...config,
    tvl:
      (parseFloat(metrics.tokensAvailable) +
        parseFloat(metrics.tokensInvested)) *
      Math.pow(10, config.asset.decimals),
    apy: parseFloat(metrics.apy7d) * 100,
    asset: {
      ...config.asset,
      price: parseFloat(metrics.tokenPrice),
    },
  };
}

export async function fetchExternalVaults(): Promise<ProcessedExternalVault[]> {
  const promises = EXTERNAL_VAULTS.map((config) =>
    processExternalVault(config)
  );
  const results = await Promise.allSettled(promises);

  return results
    .filter(
      (result): result is PromiseFulfilledResult<ProcessedExternalVault> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

export function getExternalVaultPythFeedIds(): string[] {
  return EXTERNAL_VAULTS.map((vault) => vault.asset.pythFeedId);
}

export function updateExternalVaultPrices(
  vaults: ProcessedExternalVault[],
  pythPriceMap: Map<string, number>
): ProcessedExternalVault[] {
  return vaults.map((vault) => {
    const pythPrice = pythPriceMap.get(vault.asset.pythFeedId);
    return {
      ...vault,
      asset: {
        ...vault.asset,
        price: pythPrice || vault.asset.price,
      },
    };
  });
}
