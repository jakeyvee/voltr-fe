"use client";

import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { chartColors } from "./chartjs-config";
import "./chartjs-config";
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
import zoomPlugin from "chartjs-plugin-zoom";

const formatValue = (value: number): string => `${value.toFixed(2)}%`;

Chart.register(
  LineController,
  LineElement,
  Filler,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  zoomPlugin
);

interface RealtimeChartProps {
  data: ChartData;
  width: number;
  height: number;
}

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

export default function RealtimeChart({
  data,
  width,
  height,
}: RealtimeChartProps) {
  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const chartValue = useRef<HTMLSpanElement>(null);
  const { theme } = useTheme();
  const {
    textColor,
    gridColor,
    tooltipTitleColor,
    tooltipBodyColor,
    tooltipBgColor,
    tooltipBorderColor,
  } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

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
            suggestedMin: 30,
            suggestedMax: 50,
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => formatValue(+value),
              color: textColor,
            },
            grid: {
              color: gridColor,
            },
          }, // Update the time scale configuration in the chart options
          x: {
            type: "time",
            time: {
              parser: "HH:mm", // Changed from "hh:mm:ss"
              unit: "hour", // Changed from "second"
              tooltipFormat: "MMM DD, HH:mm", // Changed format to show hours
              displayFormats: {
                hour: "HH:mm", // Changed to show hours and minutes
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
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              drag: {
                enabled: true,
              },
              mode: "xy",
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              weight: 600,
            },
            callbacks: {
              label: (context) => formatValue(context.parsed.y),
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
        animation: false,
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
    <>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl font-bold text-green-200 mr-2 tabular-nums">
            <span ref={chartValue}>37.54</span>%
          </div>

          <div className="text-xs font-medium px-1.5 rounded-full bg-indigo-500/20 text-indigo-300/80">
            7d APY
          </div>
        </div>
      </div>
      <div className="">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </>
  );
}
