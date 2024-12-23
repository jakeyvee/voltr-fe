// Import Chart.js
import { Chart, Tooltip } from "chart.js";

import tailwindConfigFile from "./tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

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

Chart.register(Tooltip);

// Define Chart.js default settings
Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = 500;
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.displayColors = false;
Chart.defaults.plugins.tooltip.mode = "nearest";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.plugins.tooltip.position = "nearest";
Chart.defaults.plugins.tooltip.caretSize = 0;
Chart.defaults.plugins.tooltip.caretPadding = 20;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 8;

interface ChartArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ColorStop {
  stop: number;
  color: string;
}

// Function that generates a gradient for line charts
export const chartAreaGradient = (
  ctx: CanvasRenderingContext2D | null,
  chartArea: ChartArea | null,
  colorStops: ColorStop[] | null
): CanvasGradient | string | null => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return "transparent";
  }
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

export const chartColors = {
  textColor: tailwindConfig.theme.colors.gray[500],
  gridColor: `rgba(${hexToRGB(tailwindConfig.theme.colors.gray[700])}, 0.6)`,
  backdropColor: tailwindConfig.theme.colors.gray[800],
  tooltipTitleColor: tailwindConfig.theme.colors.gray[100],
  tooltipBodyColor: tailwindConfig.theme.colors.gray[400],
  tooltipBgColor: tailwindConfig.theme.colors.gray[700],
  tooltipBorderColor: tailwindConfig.theme.colors.gray[600],
};
