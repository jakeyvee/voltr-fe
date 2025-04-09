import RealtimeChart from "./realtime-chart";
import { chartAreaGradient } from "./chartjs-config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfigFile from "../tailwind.config";

export interface DailyStats {
  dateLabels: string[];
  apyData: number[];
  tvlData: number[];
  lpData: number[];
  tokenName: string;
}

interface DailyData {
  dateLabels: string[];
  data: number[];
  stat: "APY" | "TVL" | "SHARE";
  tokenName: string;
}

const tailwindConfig = resolveConfig(tailwindConfigFile) as any;

const hexToRGB = (h: string): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (h.length === 4) {
    r = parseInt(`0x${h[1]}${h[1]}`);
    g = parseInt(`0x${h[2]}${h[2]}`);
    b = parseInt(`0x${h[3]}${h[3]}`);
  } else if (h.length === 7) {
    r = parseInt(`0x${h[1]}${h[2]}`);
    g = parseInt(`0x${h[3]}${h[4]}`);
    b = parseInt(`0x${h[5]}${h[6]}`);
  }
  return `${+r},${+g},${+b}`;
};

export default function ChartCardComponent({
  dateLabels,
  data,
  stat,
  tokenName,
}: DailyData) {
  // convert 2025-01-17 00:00:00+00 string to Date
  const dateLabelsDate = dateLabels.map((date) => new Date(date));

  const chartData = {
    labels: dateLabelsDate,
    datasets: [
      {
        data: data,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          const gradientOrColor = chartAreaGradient(ctx, chartArea, [
            {
              stop: 0,
              color: `rgba(${hexToRGB(
                tailwindConfig.theme.colors.indigo[500]
              )}, 0)`,
            },
            {
              stop: 1,
              color: `rgba(${hexToRGB(
                tailwindConfig.theme.colors.indigo[500]
              )}, 0.2)`,
            },
          ]);
          return gradientOrColor || "transparent";
        },
        borderColor: tailwindConfig.theme.colors.indigo[500],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig.theme.colors.indigo[500],
        pointHoverBackgroundColor: tailwindConfig.theme.colors.indigo[500],
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <RealtimeChart
      data={chartData}
      width={595}
      height={256}
      stat={stat}
      tokenName={tokenName}
    />
  );
}
