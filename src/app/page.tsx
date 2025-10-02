import VaultsGrid from "@/components/vaults-grid";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import LayersBg from "@/../public/images/layers_bg.png";
import { formatNumber } from "@/lib/format";

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

export default async function Home() {
  // Mock data - replace with actual API calls
  const tvl = await getTvlData();
  const totalStrategies = 6;

  return (
    <div className="min-h-[calc(100vh-15.5rem)]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-3 lg:gap-6">
          {/* Left Container - Main CTA */}
          <div
            className="lg:col-span-5 rounded-xl p-6 lg:p-8 flex flex-col justify-between h-[35rem] lg:h-[38rem] relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, oklch(87% 0.065 274.039) 1.84%, oklch(78.5% 0.115 274.713) 23.3%, oklch(67.3% 0.182 276.935) 35.22%, oklch(58.5% 0.233 277.117) 47.62%, #38306F 66.28%, #000000 99.59%)",
            }}
          >
            <div className="relative z-10">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                Earn With Confidence
              </h1>
              <p className="text-base lg:text-lg text-white/70 mb-6 max-w-2xl">
                Maximize your stablecoin yields with institutional-grade
                strategies. Access the highest returns across DeFi, CeFi, and
                traditional markets.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  target="_blank"
                  href="https://tally.so/r/mVyajN"
                  className="group flex items-center gap-2 px-6 py-2.5 border border-white rounded-2xl text-white text-sm hover:bg-white hover:text-indigo-600 transition-all duration-300"
                >
                  <span>Get private beta access</span>
                  <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
              <Image src={LayersBg} alt="Gradient" className="w-full h-full" />
            </div>
          </div>

          {/* Right Side - Stacked Containers */}
          <div className="lg:col-span-3 grid grid-rows-2 gap-3 lg:gap-6">
            {/* TVL Container */}
            <div className="rounded-xl p-6 bg-gray-900 flex flex-col justify-between h-[13.5rem] lg:h-[18.1875rem] overflow-hidden border border-gray-800">
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-indigo-400 tracking-tight">
                    $
                  </h2>
                  <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight">
                    {formatNumber(tvl)}
                  </h2>
                </div>
              </div>
              <div className="flex justify-between items-end gap-2">
                <h3 className="text-xl lg:text-2xl text-white font-medium">
                  Total Value Locked
                </h3>
              </div>
            </div>

            {/* Total Strategies Container */}
            <div className="rounded-xl p-6 bg-indigo-500 flex flex-col justify-between h-[13.5rem] lg:h-[18.1875rem] overflow-hidden">
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <h2 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-gray-900 tracking-tight">
                    0{totalStrategies}
                  </h2>
                </div>
              </div>
              <div className="flex justify-between items-end gap-2">
                <h3 className="text-xl lg:text-2xl text-gray-900 font-medium">
                  Active Strategies
                </h3>
              </div>
            </div>
          </div>
        </div>
        {/* Fund Managers Section */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-0">
            {/* Header Card */}
            <div className="rounded-xl lg:rounded-r-none bg-gray-900 text-white p-6 lg:h-[20.5625rem] h-[16rem] flex flex-col justify-between">
              <div>
                <h2 className="text-4xl font-bold uppercase leading-tight tracking-tight mb-4">
                  Elite Managers
                </h2>
                <p className="text-sm text-gray-400 leading-tight tracking-wider">
                  Proven strategies from <br />
                  industry-leading fund managers.
                </p>
              </div>
            </div>

            <Link
              href="https://elemental.fund"
              className="rounded-xl lg:rounded-none bg-gray-900 hover:bg-indigo-500 text-white hover:text-gray-900 group transition-all duration-700 ease-in-out lg:h-[20.5625rem] h-[16rem] relative overflow-hidden"
            >
              <div className="absolute top-5 left-6 z-10">
                <img
                  alt="Elemental Fund"
                  src="https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/elemental-clear.png"
                  className="w-14 h-14 transition duration-300 ease-in-out group-hover:hidden lg:group-hover:block lg:group-hover:grayscale"
                />
              </div>
              <div className="absolute bottom-6 right-6 z-30">
                <div className="w-7 h-7 border border-white group-hover:border-gray-900 rounded-full p-1 flex justify-center items-center hover:bg-white hover:text-black hover:!border-transparent transition-all duration-300">
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                <div className="text-xl font-medium tracking-tight group-hover:text-gray-900 transition-all ease-[cubic-bezier(0.3,1.5,0.7,1)] duration-500 transform origin-top-left group-hover:scale-75">
                  Elemental Fund
                </div>
                <div className="text-xl font-light text-white/50 group-hover:text-gray-900/50 tracking-tight transition-all ease-[cubic-bezier(0.3,1.5,0.7,1)] duration-500 transform group-hover:mb-4 origin-top-left group-hover:scale-75">
                  DeFi Strategy Manager
                </div>
                <div className="text-sm leading-tight tracking-tight text-gray-900/50 hidden group-hover:block w-4/5 font-light transition-opacity duration-500">
                  Elemental started on Solana with a modest pool of $1,000 from
                  a few early adopters in September 2022. Since then, Elemental
                  has grown into a leading Solana-based crypto fund that makes
                  investing in DeFi simple.
                </div>
              </div>
            </Link>

            <Link
              href="https://vectis.finance"
              className="rounded-xl lg:rounded-l-none bg-gray-900 hover:bg-indigo-500 text-white hover:text-gray-900 group transition-all duration-700 ease-in-out lg:h-[20.5625rem] h-[16rem] relative overflow-hidden"
            >
              <div className="absolute top-5 left-6 z-10">
                <img
                  alt="Vectis Finance"
                  src="https://lh0wrlblwpfflwdq.public.blob.vercel-storage.com/vectis-JAVpHQEjrVIZHc17osumDhnEmcQlcz.png"
                  className="w-14 h-14 transition duration-300 ease-in-out group-hover:hidden lg:group-hover:block lg:group-hover:grayscale"
                />
              </div>
              <div className="absolute bottom-6 right-6 z-30">
                <div className="w-7 h-7 border border-white group-hover:border-gray-900 rounded-full p-1 flex justify-center items-center hover:bg-white hover:text-black hover:!border-transparent transition-all duration-300">
                  <ArrowUpRightIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full">
                <h3 className="text-xl font-medium tracking-tight group-hover:text-gray-900 transition-all ease-[cubic-bezier(0.3,1.5,0.7,1)] duration-500 transform origin-top-left group-hover:scale-75">
                  Vectis Finance
                </h3>
                <div className="text-xl font-light text-white/50 group-hover:text-gray-900/50 tracking-tight transition-all ease-[cubic-bezier(0.3,1.5,0.7,1)] duration-500 transform group-hover:mb-4 origin-top-left group-hover:scale-75">
                  DeFi Strategy Manager
                </div>
                <div className="text-sm leading-tight tracking-tight text-gray-900/50 hidden group-hover:block w-4/5 font-light transition-opacity duration-500">
                  Vectis Finance offers advanced, automated yield optimization
                  strategies on Solana. Their vaults use delta-neutral and
                  risk-hedging techniques to maximize stablecoin returns while
                  minimizing market exposure.
                </div>
              </div>
            </Link>
          </div>
        </div>
        <VaultsGrid />
      </div>
    </div>
  );
}
