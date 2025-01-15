import Link from "next/link";

function getMaturityInfo(unixTs: number) {
  const maturityDate = new Date(unixTs * 1000);
  const now = new Date();
  const diffTime = now.getTime() - maturityDate.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = maturityDate.toLocaleDateString("en-US", options);

  return {
    date: formattedDate,
    daysLeft: daysLeft > 0 ? daysLeft : 0,
  };
}

export default function MarketsTable() {
  const markets = [
    {
      marketId: "Ga27bYA5tP8xGSRfWuY8PC4q3yJKPktX54kDU85uwghX",
      asset: {
        name: "USDC Lending Optimizer",
        fullName: "@voltrxyz",
        icon: "https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/usdc.svg",
      },
      maturity: {
        unixTs: 1734557736,
      },
      ammTvl: 534103.2,
      capacity: 1000000,
      pt: {
        apy: "37.54",
      },
    },
  ];

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="bg-gray-900 relative shadow-md sm:rounded-lg overflow-hidden">
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
                    APY (7d)
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {" "}
                {markets.map((market, index) => {
                  const maturityInfo = getMaturityInfo(market.maturity.unixTs);
                  return (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="px-4 py-3 flex items-center">
                        <img
                          src={market.asset.icon}
                          alt={market.asset.name}
                          className="w-10 h-10 mr-3 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-white">
                            {market.asset.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {market.asset.fullName}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">
                          {maturityInfo.daysLeft} days
                        </div>
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
                                  alt="USDC icon"
                                  src="https://drift-public.s3.eu-central-1.amazonaws.com/assets/icons/markets/usdc.svg"
                                />
                                <span className="typo-t5">
                                  {(market.ammTvl / 1000).toFixed(2)}K
                                </span>
                              </div>
                              <span className="typo-b5 text-text-secondary">
                                {(
                                  (market.ammTvl / market.capacity) *
                                  100
                                ).toFixed(2) + "%"}
                              </span>
                            </div>
                            <div className="w-full overflow-hidden rounded-full bg-gray-600 h-[6px]">
                              <div
                                className="h-full bg-indigo-700"
                                style={{
                                  width:
                                    (market.ammTvl / market.capacity) * 100 +
                                    "%",
                                }}
                              ></div>
                            </div>
                          </div>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-green-300">
                          {market.pt.apy + "%"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">
                        <div className="bg-indigo-500/30 rounded-lg px-3 py-1.5 items-center">
                          <Link href={`/vault/${market.marketId}`}>
                            <div className="flex items-center justify-between flex flex-col">
                              <div>
                                <div className="text-indigo-200 font-semibold hover:text-indigo-100">
                                  View Vault
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
