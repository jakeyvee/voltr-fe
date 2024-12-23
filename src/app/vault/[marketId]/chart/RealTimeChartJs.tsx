"use client";

import { useState, useEffect } from "react";
import RealtimeChart from "./realtime-chart";
import { chartAreaGradient } from "./chartjs-config";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfigFile from "./tailwind.config";

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

export default function ChartCardComponent() {
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  const data = [
    28.74, 28.66, 25.53, 23.87, 22.3, 21.07, 19.4, 21.4, 25.54, 27.44, 23.11,
    26.82, 29.09, 25.72, 29.22, 25.17, 29.93, 32.01, 33.57, 36.25, 39.92, 37.89,
    40.0, 34.9, 33.09, 30.85, 24.96, 31.56, 23.2, 20.62, 19.28, 17.48, 15.33,
    17.7, 15.0, 17.3, 18.26, 21.03, 24.06, 22.68, 19.22, 29.72, 22.62, 28.42,
    30.51, 30.88, 29.98, 30.96, 26.15, 28.6, 18.82, 26.63, 28.13, 22.22, 26.16,
    26.0, 23.4, 21.62, 18.31,
  ];

  const [slicedData, setSlicedData] = useState(data.slice(0, range));

  // Generate hourly dates from now to back in time
  const generateDates = (): Date[] => {
    const now: Date = new Date();
    const dates: Date[] = [];

    data.forEach((v: any, i: number) => {
      // Subtract i hours from now for each data point
      dates.push(new Date(now.getTime() - i * 60 * 60 * 1000));
    });

    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(
    generateDates().slice(0, range).reverse()
  );

  // Update every hour
  useEffect(() => {
    // Calculate milliseconds until the next hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    const timeUntilNextHour = nextHour.getTime() - now.getTime();

    // Initial timeout to sync with the hour
    const initialTimeout = setTimeout(() => {
      setCounter(counter + 1);

      // Then set up the hourly interval
      const interval = setInterval(() => {
        setCounter((c) => c + 1);
      }, 60 * 60 * 1000); // 1 hour in milliseconds

      return () => clearInterval(interval);
    }, timeUntilNextHour);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Update data when counter changes
  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < data.length) {
      setSlicedData(([x, ...slicedData]) => [
        ...slicedData,
        data[increment + range],
      ]);
    } else {
      setIncrement(0);
      setRange(0);
    }
    setSlicedLabels(([x, ...slicedLabels]) => [...slicedLabels, new Date()]);
    return () => setIncrement(0);
  }, [counter]);

  const chartData = {
    labels: slicedLabels,
    datasets: [
      {
        data: slicedData,
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

  return <RealtimeChart data={chartData} width={595} height={256} />;
}
