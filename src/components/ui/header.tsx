import { formatNumber } from "@/lib/format";
import Logo from "./logo-words";
import WalletButton from "./wallet-button";

interface TvlData {
  success: boolean;
  data: {
    totalTvlUsd: number;
    lastUpdated: string;
  };
}

async function getTvlData(): Promise<number | null> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/vaults/tvl`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error("Failed to fetch TVL data");
    }

    const data: TvlData = await response.json();

    if (data.success) {
      return data.data.totalTvlUsd;
    }

    return null;
  } catch (error) {
    console.error("Error fetching TVL:", error);
    return null;
  }
}

export default async function Header() {
  const tvlData = await getTvlData();

  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-[#0c111d]/90 px-3 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,theme(colors.gray.800),theme(colors.gray.700),theme(colors.gray.800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] after:absolute after:inset-0 after:-z-10 after:backdrop-blur-sm">
          {/* Site branding */}
          <div className="flex flex-1 items-center gap-4">
            <Logo />
          </div>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            {/* TVL Display */}
            <div className="items-center gap-2 text-sm text-gray-300">
              <span className="font-mono font-medium tracking-wider text-white">
                {tvlData !== null ? `TVL:${formatNumber(tvlData)}` : "--"}
              </span>
            </div>
            <li>
              <WalletButton />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
