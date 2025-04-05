import { useEffect, useState } from "react";
import ChartCardComponent, { DailyApy } from "./RealTimeChartJs";

export default function ChartCard(dailyApy: DailyApy) {
  const [period, setPeriod] = useState<"7D" | "30D" | "ALL">("7D");

  return (
    <div className="bg-gray-900 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-700/60 flex md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <h2 className="font-semibold text-gray-100">Historical Daily APY</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            className={`px-2 py-1 rounded ring-1 hover:bg-indigo-100/20 hover:ring-indigo-600 leading-5 hover:text-white duration-150 ${
              period === "7D"
                ? "bg-indigo-300/30 ring-indigo-500 text-white"
                : "ring-indigo-200/20 text-indigo-100/70"
            }`}
            onClick={() => setPeriod("7D")}
          >
            7D
          </button>
          <button
            className={`px-2 py-1 rounded ring-1 hover:bg-indigo-100/20 hover:ring-indigo-600 leading-5 hover:text-white duration-150 ${
              period === "30D"
                ? "bg-indigo-300/30 ring-indigo-500 text-white"
                : "ring-indigo-200/20 text-indigo-100/70"
            }`}
            onClick={() => setPeriod("30D")}
          >
            30D
          </button>
          <button
            className={`px-2 py-1 rounded ring-1 hover:bg-indigo-100/20 hover:ring-indigo-600 leading-5 hover:text-white duration-150 ${
              period === "ALL"
                ? "bg-indigo-300/30 ring-indigo-500 text-white"
                : "ring-indigo-200/20 text-indigo-100/70"
            }`}
            onClick={() => setPeriod("ALL")}
          >
            ALL
          </button>
        </div>
      </header>
      <div className="flex-grow chart-wrapper p-4 pl-2">
        {period === "ALL" ? (
          <ChartCardComponent {...dailyApy} />
        ) : period === "30D" ? (
          <ChartCardComponent
            dateLabels={dailyApy.dateLabels.slice(
              -30,
              dailyApy.dateLabels.length
            )}
            apyData={dailyApy.apyData.slice(-30, dailyApy.apyData.length)}
          />
        ) : (
          <ChartCardComponent
            dateLabels={dailyApy.dateLabels.slice(
              -7,
              dailyApy.dateLabels.length
            )}
            apyData={dailyApy.apyData.slice(-7, dailyApy.apyData.length)}
          />
        )}
      </div>
    </div>
  );
}
