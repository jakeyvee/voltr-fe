import { formatNumber } from "@/lib/format";

interface MetricCardProps {
  totalLiquidity: number;
  vaultApy: {
    oneDay: number;
    sevenDays: number;
    thirtyDays: number;
    allTime: number;
  };
  assetPrice: number;
  tokenDecimals: number;
  tokenName: string;
}

export default function MetricCard({
  totalLiquidity,
  vaultApy,
  assetPrice,
  tokenDecimals,
  tokenName,
}: MetricCardProps) {
  const totalLiquidityAdjusted = totalLiquidity / Math.pow(10, tokenDecimals);
  const liquidityPrice = assetPrice * totalLiquidityAdjusted;

  return (
    <div className="grid md:grid-cols-2 gap-2">
      <div className="bg-gray-900 shadow-sm rounded-xl flex flex-col">
        <div className="px-5 py-4 flex flex-row justify-between">
          <div className="flex flex-col space-y-2 justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              Total Liquidity
            </h2>
            <div className="flex flex-col space-y-2">
              <div className="text-2xl lg:text-3xl text-title font-semibold leading-none">
                {formatNumber(totalLiquidityAdjusted)} {tokenName}
              </div>
              <div className="text-xs lg:text-xl text-gray-500 font-medium leading-none">
                ${formatNumber(liquidityPrice)}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 shadow-sm rounded-xl flex flex-col relative">
        <div className="px-5 py-3">
          <div className="w-full grid grid-cols-2">
            <div className="flex flex-col items-center justify-center py-2 space-y-0.5 border-r border-b border-slate-700/60">
              <h2 className="text-xs font-medium text-gray-500">24H APY</h2>
              <div className="font-medium text-gray-100">
                {formatNumber(vaultApy.oneDay)}%
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 space-y-0.5 border-b border-slate-700/60">
              <h2 className="text-xs font-medium text-gray-500">7D APY</h2>
              <div className="font-medium text-gray-100">
                {formatNumber(vaultApy.sevenDays)}%
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 space-y-0.5 border-r border-slate-700/60">
              <h2 className="text-xs font-medium text-gray-500">30D APY</h2>
              <div className="font-medium text-gray-100">
                {formatNumber(vaultApy.thirtyDays)}%
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-2 space-y-0.5">
              <h2 className="text-xs font-medium text-gray-500">
                All-Time APY
              </h2>
              <div className="font-medium text-gray-100">
                {formatNumber(vaultApy.allTime)}%
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-gray-900 z-10"></div>
        </div>
      </div>
    </div>
  );
}
