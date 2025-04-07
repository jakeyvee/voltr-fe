import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/vaults`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { vaults }: { vaults: Vault[] } = await res.json();
  return vaults;
};

export default async function MarketsTable() {
  const vaults = await getVaultsInfo();

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="bg-gray-900 relative shadow-md md:rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-800 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Vault
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Base Asset
                  </th>
                  <th scope="col" className="px-4 py-3">
                    TVL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Manager
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Integrations
                  </th>
                  <th scope="col" className="px-4 py-3">
                    7D APY
                  </th>
                  <th scope="col" className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {vaults.map((vault, index) => {
                  return (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">
                            {vault.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {vault.theme}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-row items-center">
                          <img
                            src={vault.asset.icon}
                            alt={vault.asset.name}
                            className="w-6 h-6 mr-1.5 rounded-full"
                          />
                          <div className="text-white">{vault.asset.name}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-white">
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center">
                            <img
                              src={vault.asset.icon}
                              alt={vault.asset.name}
                              className="w-4 h-4 mr-1 rounded-full"
                            />
                            {vault.tvl / Math.pow(10, vault.asset.decimals) > 1
                              ? (
                                  vault.tvl / Math.pow(10, vault.asset.decimals)
                                ).toFixed(2)
                              : (
                                  vault.tvl / Math.pow(10, vault.asset.decimals)
                                ).toPrecision(3)}{" "}
                          </div>
                          <div>
                            US$
                            {(vault.asset.price * vault.tvl) /
                              Math.pow(10, vault.asset.decimals) >
                            1
                              ? (
                                  (vault.asset.price * vault.tvl) /
                                  Math.pow(10, vault.asset.decimals)
                                ).toFixed(2)
                              : (
                                  (vault.asset.price * vault.tvl) /
                                  Math.pow(10, vault.asset.decimals)
                                ).toPrecision(3)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-row items-center">
                          <img
                            src={vault.org.icon}
                            alt={vault.org.name}
                            className="w-6 h-6 mr-1.5 rounded-full"
                          />
                          <div className="text-white">{vault.org.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {vault.allocations.map((allocation, index) => (
                            <img
                              key={index}
                              className={`w-6 h-6 rounded-full ${
                                index === 0 ? "ml-0" : "-ml-1"
                              }`}
                              alt={allocation.orgName}
                              src={allocation.orgIcon}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-green-300">
                          {(vault.apy > 1
                            ? vault.apy.toFixed(2)
                            : vault.apy.toPrecision(3)) + "%"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">
                        <div className="bg-indigo-500/30 rounded-lg px-3 py-1.5 items-center">
                          <Link href={`/vault/${vault.pubkey}`}>
                            <div className="flex items-center justify-between flex flex-col">
                              <div>
                                <div className="text-indigo-200 font-semibold hover:text-indigo-100">
                                  Deposit
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
