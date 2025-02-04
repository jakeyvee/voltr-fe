import Link from "next/link";

export interface VaultCardProp {
  vaultDescription: string;
  vaultExternalUri: string;
  vaultAPY: {
    oneDay: number;
    sevenDays: number;
    thirtyDays: number;
  };
}

export default function VaultCard({
  vaultExternalUri,
  vaultDescription,
  vaultAPY,
}: VaultCardProp) {
  return (
    <div className="bg-gray-900 shadow-sm rounded-xl">
      <div className="flex flex-col h-full">
        <div className="grow py-3 px-5 space-y-2 border-b border-slate-700/60">
          <h2 className="text-sm font-medium text-gray-500">About Vault</h2>
          <div className="flex flex-col space-y-1">
            <div>{vaultDescription}</div>
            <div className="w-full flex justify-end">
              <Link
                href={vaultExternalUri}
                target="_blank"
                className="text-xs font-medium text-indigo-500 hover:text-indigo-400"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="w-full grid grid-cols-12">
            <div className="col-span-4 flex flex-col items-center justify-center py-2 space-y-0.5 border-r border-slate-700/60">
              <h2 className="text-xs font-medium text-gray-500">1D APY</h2>
              <div className="font-medium text-gray-100">
                {vaultAPY.oneDay > 1
                  ? vaultAPY.oneDay.toFixed(2)
                  : vaultAPY.oneDay.toPrecision(3)}
                %
              </div>
            </div>
            <div className="col-span-4 flex flex-col items-center justify-center py-2 space-y-0.5 border-r border-slate-700/60">
              <h2 className="text-xs font-medium text-gray-500">7D APY</h2>
              <div className="font-medium text-gray-100">
                {vaultAPY.sevenDays > 1
                  ? vaultAPY.sevenDays.toFixed(2)
                  : vaultAPY.sevenDays.toPrecision(3)}
                %
              </div>
            </div>
            <div className="col-span-4 flex flex-col items-center justify-center py-2 space-y-0.5">
              <h2 className="text-xs font-medium text-gray-500">30D APY</h2>
              <div className="font-medium text-gray-100">
                {vaultAPY.thirtyDays > 1
                  ? vaultAPY.thirtyDays.toFixed(2)
                  : vaultAPY.thirtyDays.toPrecision(3)}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
