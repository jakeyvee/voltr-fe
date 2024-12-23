import ChartCardComponent from "./RealTimeChartJs";

export default function ChartCard() {
  return (
    <div className="flex flex-col col-span-full sm:col-span-8 bg-gray-900 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-700/60 flex md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <h2 className="font-semibold text-gray-100">{`USDC Lending Optimizer`}</h2>
        </div>
        <p> by @voltrxyz</p>
      </header>
      <div className="flex-grow chart-wrapper p-4 pl-2">
        <ChartCardComponent />
      </div>
    </div>
  );
}
