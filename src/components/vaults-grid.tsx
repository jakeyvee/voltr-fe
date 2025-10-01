import { formatNumber } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
interface Vault {
  pubkey: string;
  name: string;
  age: number;
  tvl: number;
  apy: number;
  capacity: number;
  theme: string;
  org: {
    name: string;
    icon: string;
  };
  asset: {
    name: string;
    icon: string;
    decimals: number;
    price: number;
  };
  allocations: {
    orgName: string;
    orgIcon: string;
  }[];
}

const getVaultsInfo = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/vaults`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { vaults }: { vaults: Vault[] } = await res.json();
  return vaults;
};

export default async function VaultsGrid() {
  const vaults = await getVaultsInfo();

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {vaults.map((vault, index) => (
          <div
            key={index}
            className="flex flex-col rounded-xl bg-gray-900 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4">
              <div className="flex w-full items-center justify-between mb-3">
                <div className="flex flex-col">
                  <h2 className="font-medium text-white text-lg">
                    {vault.name}
                  </h2>
                  <div className="text-sm text-gray-400">{vault.theme}</div>
                </div>
                <div className="text-green-300 text-lg font-medium">
                  {formatNumber(vault.apy)}%
                  <span className="text-xs text-gray-400 font-normal -ml-0.5">
                    APY
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 mt-4 border-t border-slate-700/60 pt-3">
                <div className="col-span-6 flex flex-col space-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={vault.asset.icon}
                      alt={vault.asset.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="text-white">{vault.asset.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={vault.org.icon}
                      alt={vault.org.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="text-white">{vault.org.name}</div>
                  </div>
                </div>

                <div className="col-span-6 flex flex-col items-end justify-between mb-3">
                  <div className="flex flex-col items-end">
                    <div className="text-xs font-medium text-gray-500">TVL</div>
                    <div className="text-gray-100">
                      US${" "}
                      {formatNumber(
                        (vault.asset.price * vault.tvl) /
                          Math.pow(10, vault.asset.decimals)
                      )}
                    </div>
                  </div>

                  <div className="flex -space-x-1.5">
                    {vault.allocations.map((allocation, idx) => (
                      <img
                        key={idx}
                        className="w-6 h-6 rounded-full border border-gray-800"
                        alt={allocation.orgName}
                        src={allocation.orgIcon}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
