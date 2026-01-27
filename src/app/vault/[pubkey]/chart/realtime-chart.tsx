"use client";

import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { chartColors } from "./chartjs-config";
import {
  Chart,
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  ChartData,
} from "chart.js";
import "chartjs-adapter-moment";
import { formatNumber } from "@/lib/format";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip
);

interface RealtimeChartProps {
  data: ChartData;
  width: number;
  height: number;
  stat: "APY" | "TVL" | "SHARE";
  tokenName: string;
}

export default React.memo(
  function RealtimeChart({
    data,
    width,
    height,
    stat,
    tokenName,
  }: RealtimeChartProps) {
    const [chart, setChart] = useState<Chart | null>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const {
      textColor,
      gridColor,
      tooltipTitleColor,
      tooltipBodyColor,
      tooltipBgColor,
      tooltipBorderColor,
    } = chartColors;

    // Calculate min and max values from the data
    const calculateRange = (chartData: ChartData) => {
      let minValue = Infinity;
      let maxValue = -Infinity;

      chartData.datasets?.forEach((dataset) => {
        const values = dataset.data as number[];
        const dataMin = Math.min(...values);
        const dataMax = Math.max(...values);

        if (dataMin < minValue) minValue = dataMin;
        if (dataMax > maxValue) maxValue = dataMax;
      });

      // Add 10% padding to min and max
      const padding = (maxValue - minValue) * 0.1;
      return {
        min: minValue - padding,
        max: maxValue + padding,
      };
    };

    const formatTick = (value: number) => {
      if (stat === "APY") return formatNumber(value) + "%";
      if (stat === "TVL") return formatNumber(value);
      if (stat === "SHARE") return value.toPrecision(5);
    };

    const formatLabel = (value: number) => {
      if (stat === "APY") return formatNumber(value) + "%";
      if (stat === "TVL") return formatNumber(value) + " " + tokenName;
      if (stat === "SHARE") return value.toPrecision(5) + " " + tokenName;
    };

    useEffect(() => {
      const ctx = canvas.current;
      if (!ctx) return;

      const range = calculateRange(data);

      const newChart = new Chart(ctx, {
        type: "line",
        data: data,
        options: {
          layout: {
            padding: 20,
          },
          scales: {
            y: {
              border: {
                display: false,
              },
              min: range.min,
              max: range.max,
              ticks: {
                maxTicksLimit: 5,
                callback: (value) => formatTick(+value),
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            x: {
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "MMM D",
                displayFormats: {
                  day: "MMM D",
                },
              },
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
              ticks: {
                autoSkipPadding: 48,
                maxRotation: 0,
                color: textColor,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              titleFont: {
                weight: 600,
              },
              callbacks: {
                label: (context) => formatLabel(context.parsed.y),
              },
              titleColor: tooltipTitleColor,
              bodyColor: tooltipBodyColor,
              backgroundColor: tooltipBgColor,
              borderColor: tooltipBorderColor,
            },
          },
          interaction: {
            intersect: false,
            mode: "nearest",
          },
          animation: {
            duration: 1500, // Animation duration in milliseconds
            easing: "easeOutQuart", // Easing function for smooth animation
          },
          maintainAspectRatio: false,
        },
      });
      setChart(newChart);
      return () => newChart.destroy();
    }, [data]);

    useEffect(() => {
      if (!chart) return;
      chart.options.scales!.x!.ticks!.color = textColor;
      chart.options.scales!.y!.ticks!.color = textColor;
      chart.options.scales!.y!.grid!.color = gridColor;
      chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor;
      chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor;
      chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor;
      chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor;
      chart.update("none");
    }, [theme]);

    return (
      <div className="">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
  }
);
