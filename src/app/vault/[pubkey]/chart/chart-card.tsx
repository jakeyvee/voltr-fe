import ChartCardComponent, { ThirtyDaysDailyApy } from "./RealTimeChartJs";

export default function ChartCard(thirtyDaysDailyApy: ThirtyDaysDailyApy) {
  return (
    <div className="bg-gray-900 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-700/60 flex md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <h2 className="font-semibold text-gray-100">30 Days Daily APY</h2>
        </div>
      </header>
      <div className="flex-grow chart-wrapper p-4 pl-2">
        <ChartCardComponent {...thirtyDaysDailyApy} />
      </div>
    </div>
  );
}
