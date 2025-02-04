"use client";

import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { chartColors } from "../chart/chartjs-config";
import "../chart/chartjs-config";
import {
  Chart,
  DoughnutController,
  ArcElement,
  TimeScale,
  Tooltip,
  ChartData,
} from "chart.js";
import "chartjs-adapter-moment";

import tailwindConfigFile from "../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const tailwindConfig = resolveConfig(tailwindConfigFile) as any;

Chart.register(DoughnutController, ArcElement, TimeScale, Tooltip);
Chart.overrides.doughnut.cutout = "80%";

interface DoughnutProps {
  data: ChartData;
  width: number;
  height: number;
}

export default function DoughnutChart({ data, width, height }: DoughnutProps) {
  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const legend = useRef<HTMLUListElement>(null);
  const { theme } = useTheme();
  const {
    tooltipTitleColor,
    tooltipBodyColor,
    tooltipBgColor,
    tooltipBorderColor,
  } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: {
        layout: {
          padding: 24,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
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
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      plugins: [
        {
          id: "htmlLegend",
          afterUpdate(c, args, options) {
            const ul = legend.current;
            if (!ul) return;
            // Remove old legend items
            while (ul.firstChild) {
              ul.firstChild.remove();
            }
          },
        },
      ],
    });
    setChart(newChart);
    return () => newChart.destroy();
  }, [data]);

  useEffect(() => {
    if (!chart) return;
    chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor;
    chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor;
    chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor;
    chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor;
    chart.update("none");
  }, [theme]);

  return (
    <div className="flex flex-col">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </div>
  );
}
