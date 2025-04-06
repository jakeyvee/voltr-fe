import { notFound } from "next/navigation";
import MarketClientPage, { VaultInformation } from "./Market";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";

// Create a function to get vault info for a specific pubkey
async function fetchVaultInfo(pubkey: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/vault/${pubkey}`, {
    cache: "force-cache",
    next: { revalidate: 300 }, // 5 minutes (300 seconds)
  });

  if (!res.ok) return null;
  const { vault }: { vault: VaultInformation } = await res.json();
  return vault;
}

// Wrap this in a cache function for each specific pubkey
const getVaultInfo = (pubkey: string) => {
  // Create a unique cache key for each vault pubkey
  const cacheKey = `vault-info-${pubkey}`;

  // Use unstable_cache with the specific key for this vault
  return unstable_cache(
    async () => fetchVaultInfo(pubkey),
    [cacheKey],
    { revalidate: 300 } // 5 minutes
  )();
};

// Fresh data fetcher
const getFreshVaultInfo = cache(async (pubkey: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/vault/${pubkey}`, {
    cache: "no-store", // Always fetch fresh data
  });

  if (!res.ok) notFound();
  const { vault }: { vault: VaultInformation } = await res.json();
  return vault;
});

// Loading component
function VaultLoading() {
  return (
    <div className="min-h-[calc(100vh-15.5rem)] max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center gap-2 animate-pulse">
        <div className="bg-gray-700 h-10 w-10 rounded-lg"></div>
        <div className="bg-gray-700 h-8 w-48 rounded-lg"></div>
      </div>
      <div className="mt-6 grid grid-cols-12 gap-2 w-full">
        <div className="flex flex-col col-span-full gap-2 order-2 md:col-span-8 md:order-1">
          <div className="bg-gray-700 h-24 rounded-xl animate-pulse"></div>
          <div className="bg-gray-700 h-64 rounded-xl animate-pulse"></div>
          <div className="bg-gray-700 h-80 rounded-xl animate-pulse"></div>
        </div>
        <div className="flex flex-col col-span-full z-0 gap-2 order-1 md:col-span-4 md:order-2">
          <div className="bg-gray-700 h-64 rounded-xl animate-pulse"></div>
          <div className="bg-gray-700 h-96 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default async function MarketPage({
  params,
}: {
  params: { pubkey: string };
}) {
  try {
    const cachedVaultPromise = getVaultInfo(params.pubkey);
    const freshVaultPromise = getFreshVaultInfo(params.pubkey);

    const cachedVault = await cachedVaultPromise;

    // If we have cached data, show it immediately
    if (cachedVault) {
      return <MarketClientPage {...cachedVault} />;
    }

    // If no cached data exists, wait for fresh data
    const freshVault = await freshVaultPromise;
    return <MarketClientPage {...freshVault} />;
  } catch (error) {
    // In case of error, show the loading state then try with suspense
    return (
      <Suspense fallback={<VaultLoading />}>
        <VaultWithFallback pubkey={params.pubkey} />
      </Suspense>
    );
  }
}

// Component that will be used as fallback in case of initial data fetch failure
async function VaultWithFallback({ pubkey }: { pubkey: string }) {
  const vault = await getFreshVaultInfo(pubkey);
  return <MarketClientPage {...vault} />;
}
