import Link from "next/link";
import { notFound } from "next/navigation";

interface Vault {
  pubkey: string;
  name: string;
  age: number;
  tvl: number;
  apy: number;
  capacity: number;
  org: {
    name: string;
    icon: string;
  };
  asset: {
    name: string;
    icon: string;
    decimals: number;
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
                    Age
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Vault TVL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Integrations
                  </th>
                  <th scope="col" className="px-4 py-3">
                    7D APY
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {vaults.map((vault, index) => {
                  return (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-3 flex items-center">
                        <img
                          src={vault.org.icon}
                          alt={vault.org.name}
                          className="w-10 h-10 mr-3 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-white">
                            {vault.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            by {vault.org.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">{vault.age} days</div>
                      </td>

                      <td className="px-4 py-3 text-white">
                        <span className="font-[300] text-[13px] leading-[16px] flex items-start flex-row">
                          <div className="w-[196px] flex flex-col gap-3 pr-2">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1">
                                <img
                                  className="w-4 h-4"
                                  width="18"
                                  height="18"
                                  alt={vault.asset.name}
                                  src={vault.asset.icon}
                                />
                                <span className="typo-t5">
                                  {vault.tvl /
                                    Math.pow(10, vault.asset.decimals) >
                                  1
                                    ? (
                                        vault.tvl /
                                        Math.pow(10, vault.asset.decimals)
                                      ).toFixed(2)
                                    : (
                                        vault.tvl /
                                        Math.pow(10, vault.asset.decimals)
                                      ).toPrecision(3)}
                                </span>
                              </div>
                              <span className="typo-b5 text-text-secondary">
                                {((vault.tvl / vault.capacity) * 100 > 1
                                  ? (vault.tvl / vault.capacity).toFixed(2)
                                  : (vault.tvl / vault.capacity).toPrecision(
                                      3
                                    )) + "%"}
                              </span>
                            </div>
                            <div className="w-full overflow-hidden rounded-full bg-gray-600 h-[6px]">
                              <div
                                className="h-full bg-indigo-700"
                                style={{
                                  width:
                                    (vault.tvl / vault.capacity) * 100 + "%",
                                }}
                              ></div>
                            </div>
                          </div>
                        </span>
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
                                  View
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
