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

export default async function MarketsTable() {
  const vaults = await getVaultsInfo();

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Desktop View (Table) - Hidden on mobile */}
        <div className="hidden md:block bg-gray-900 relative shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400 table-fixed">
              <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 w-48">
                    Vault
                  </th>
                  <th scope="col" className="px-4 py-3 w-36">
                    Base Asset
                  </th>
                  <th scope="col" className="px-4 py-3 w-40">
                    TVL
                  </th>
                  <th scope="col" className="px-4 py-3 w-44">
                    Manager
                  </th>
                  <th scope="col" className="px-4 py-3 w-36">
                    Integrations
                  </th>
                  <th scope="col" className="px-4 py-3 w-28">
                    30D APY
                  </th>
                  <th scope="col" className="px-4 py-3 w-32"></th>
                </tr>
              </thead>
              <tbody>
                {vaults.map((vault, index) => {
                  return (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-3 w-48">
                        <div>
                          <div className="font-medium text-white">
                            {vault.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {vault.theme}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-36">
                        <div className="flex flex-row items-center">
                          <img
                            src={vault.asset.icon}
                            alt={vault.asset.name}
                            className="w-6 h-6 mr-1.5 rounded-full"
                          />
                          <div className="text-white">{vault.asset.name}</div>
                        </div>
                      </td>

                      <td className="px-4 py-3 w-40 text-white">
                        <div className="flex flex-col">
                          <div className="flex flex-row items-center">
                            <img
                              src={vault.asset.icon}
                              alt={vault.asset.name}
                              className="w-4 h-4 mr-1 rounded-full"
                            />
                            {formatNumber(
                              vault.tvl / Math.pow(10, vault.asset.decimals)
                            )}
                          </div>
                          <div>
                            US$
                            {formatNumber(
                              (vault.asset.price * vault.tvl) /
                                Math.pow(10, vault.asset.decimals)
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-44">
                        <div className="flex flex-row items-center">
                          <img
                            src={vault.org.icon}
                            alt={vault.org.name}
                            className="w-6 h-6 mr-1.5 rounded-full"
                          />
                          <div className="text-white">{vault.org.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 w-36">
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
                      <td className="px-4 py-3 w-28">
                        <div className="text-green-300">
                          {formatNumber(vault.apy)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 w-32 text-white">
                        <div className="bg-indigo-500/30 rounded-lg px-3 py-1.5 items-center">
                          <Link
                            href={
                              vault.name.includes("Turbo")
                                ? `https://kamino.com/earn/${vault.pubkey}`
                                : `/vault/${vault.pubkey}`
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-indigo-200 font-semibold hover:text-indigo-100 mx-auto">
                                View More
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

        {/* Mobile View (Cards) - Shown only on mobile */}
        <div className="md:hidden flex flex-col gap-4">
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
                      <div className="text-xs font-medium text-gray-500">
                        TVL
                      </div>
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

                <Link
                  href={
                    vault.name.includes("Turbo")
                      ? `https://kamino.com/earn/${vault.pubkey}`
                      : `/vault/${vault.pubkey}`
                  }
                  className="btn w-full bg-gradient-to-t from-indigo-600 to-indigo-500 text-white shadow-inner hover:bg-gradient-to-b"
                >
                  <span className="text-[16px] font-semibold text-indigo-200">
                    View More
                  </span>
                  <svg
                    className="w-4 h-4 text-indigo-200 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 10"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.9816 4.63341C11.0697 4.72156 11.1191 4.84105 11.1191 4.96564C11.1191 5.09023 11.0697 5.20972 10.9816 5.29787L7.22053 9.05899C7.17749 9.10518 7.12559 9.14223 7.06792 9.16792C7.01025 9.19362 6.94799 9.20743 6.88486 9.20855C6.82174 9.20966 6.75904 9.19805 6.7005 9.1744C6.64195 9.15076 6.58878 9.11556 6.54413 9.07092C6.49949 9.02628 6.46429 8.9731 6.44065 8.91456C6.417 8.85602 6.40539 8.79331 6.4065 8.73019C6.40762 8.66706 6.42144 8.60481 6.44713 8.54714C6.47283 8.48947 6.50988 8.43756 6.55607 8.39452L9.51481 5.43578L0.619773 5.43578C0.495083 5.43578 0.375501 5.38625 0.287332 5.29808C0.199164 5.20991 0.149632 5.09033 0.149632 4.96564C0.149632 4.84095 0.199164 4.72137 0.287332 4.6332C0.375501 4.54503 0.495083 4.4955 0.619773 4.4955L9.51481 4.4955L6.55607 1.53675C6.50988 1.49371 6.47283 1.44181 6.44713 1.38414C6.42144 1.32647 6.40762 1.26422 6.4065 1.20109C6.40539 1.13796 6.417 1.07526 6.44065 1.01672C6.46429 0.958179 6.49949 0.905 6.54413 0.860357C6.58878 0.815713 6.64195 0.780519 6.7005 0.756873C6.75904 0.733228 6.82174 0.721616 6.88486 0.722729C6.94799 0.723843 7.01025 0.73766 7.06792 0.763356C7.12559 0.789052 7.17749 0.8261 7.22053 0.872291L10.9816 4.63341Z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
