interface MetricCardProps {
  totalLiquidity: number;
  realtimeApy: number;
  assetPrice: number;
  tokenDecimals: number;
}

export default function MetricCard({
  totalLiquidity,
  realtimeApy,
  assetPrice,
  tokenDecimals,
}: MetricCardProps) {
  const totalLiquidityAdjusted = totalLiquidity / Math.pow(10, tokenDecimals);
  const liquidityPrice = assetPrice * totalLiquidityAdjusted;
  const liquidityPriceFormatted =
    liquidityPrice > 1
      ? liquidityPrice.toFixed(2)
      : liquidityPrice.toPrecision(3);
  const totalLiquidityFormatted =
    totalLiquidityAdjusted > 1
      ? totalLiquidityAdjusted.toFixed(2)
      : totalLiquidityAdjusted.toPrecision(3);
  const realtimeApyFormatted =
    realtimeApy > 1 ? realtimeApy.toFixed(2) : realtimeApy.toPrecision(3);

  return (
    <div className="bg-gray-900 shadow-sm rounded-xl flex flex-col">
      <div className="px-5 py-4 flex flex-row justify-between">
        <div className="flex flex-col space-y-2 justify-between">
          <h2 className="text-sm font-medium text-gray-500">Total Liquidity</h2>
          <div className="flex flex-col space-y-2">
            <div className="text-2xl lg:text-3xl text-title font-semibold leading-none">
              {totalLiquidityFormatted} SOL
            </div>
            <div className="text-xs lg:text-xl text-gray-500 font-medium leading-none">
              ${liquidityPriceFormatted}
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2 items-end">
          <h2 className="text-sm font-medium text-gray-500">Current APY</h2>
          <div className="text-xl lg:text-3xl text-title font-semibold leading-none">
            {realtimeApyFormatted}%
          </div>
        </div>
      </div>
    </div>
  );
}
