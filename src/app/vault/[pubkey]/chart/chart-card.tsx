import { useMemo, useState } from "react";
import ChartCardComponent, { DailyStats } from "./RealTimeChartJs";
import Dropdown from "rc-dropdown";
import Menu, { Item as MenuItem } from "rc-menu";
import "rc-dropdown/assets/index.css";
import "./dropdown-custom.css"; // We'll create this custom CSS file

export default function ChartCard({
  dateLabels,
  apyData,
  tvlData,
  lpData,
  tokenName,
}: DailyStats) {
  const shareData = useMemo(
    () => lpData.map((lp, index) => tvlData[index] / (lp / Math.pow(10, 9))),
    [lpData, tvlData]
  );
  const [period, setPeriod] = useState<"7D" | "30D" | "ALL">("7D");
  const [stats, setStats] = useState<"APY" | "TVL" | "SHARE">("APY");

  const handleStatsChange = (info: { key: string }) => {
    setStats(info.key as "APY" | "TVL" | "SHARE");
  };

  const menu = (
    <Menu
      onClick={handleStatsChange}
      selectedKeys={[stats]}
      className="stats-dropdown-menu"
    >
      <MenuItem key="APY" className="font-ataero text-sm stats-dropdown-item">
        APY
      </MenuItem>
      <MenuItem key="TVL" className="font-ataero text-sm stats-dropdown-item">
        TVL
      </MenuItem>
      <MenuItem key="SHARE" className="font-ataero text-sm stats-dropdown-item">
        SHARE
      </MenuItem>
    </Menu>
  );

  return (
    <div className="bg-gray-900 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-700/60 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <h2 className="font-semibold text-gray-100">Past Daily Stats</h2>
        </div>
        <div className="flex items-center gap-3 ">
          <Dropdown
            overlay={menu}
            trigger={["click"]}
            overlayClassName="stats-dropdown-wrapper"
          >
            <button className="w-24 px-2 py-1 rounded ring-1 text-white ring-indigo-200/20 text-indigo-100/70 hover:bg-indigo-100/20 hover:ring-indigo-600 leading-5 text-sm flex justify-between">
              <h2>{stats} </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-indigo-400/60 sm:size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </Dropdown>

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
        </div>
      </header>
      <div className="flex-grow chart-wrapper p-4 pl-2">
        {period === "ALL" ? (
          <ChartCardComponent
            dateLabels={dateLabels}
            data={
              stats === "APY" ? apyData : stats === "TVL" ? tvlData : shareData
            }
            tokenName={tokenName}
            stat={stats}
          />
        ) : period === "30D" ? (
          <ChartCardComponent
            dateLabels={dateLabels.slice(-30, dateLabels.length)}
            data={(stats === "APY"
              ? apyData
              : stats === "TVL"
              ? tvlData
              : shareData
            ).slice(-30, dateLabels.length)}
            tokenName={tokenName}
            stat={stats}
          />
        ) : (
          <ChartCardComponent
            dateLabels={dateLabels.slice(-7, dateLabels.length)}
            data={(stats === "APY"
              ? apyData
              : stats === "TVL"
              ? tvlData
              : shareData
            ).slice(-7, dateLabels.length)}
            tokenName={tokenName}
            stat={stats}
          />
        )}
      </div>
    </div>
  );
}
