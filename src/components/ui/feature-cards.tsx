import type { CSSProperties, ReactNode } from "react";
import { CheckCircleIcon, CubeTransparentIcon } from "@heroicons/react/24/solid";

/* ---------- shared building blocks ---------- */

const CHIP =
  "rounded-xl border border-white/10 bg-gradient-to-b from-[#1a1f30] to-[#0e121d] shadow-[0_6px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]";

function Badge({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-gradient-to-b from-[#1a1f30] to-[#0c111d] px-4 py-2 text-[11px] font-medium text-gray-300 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]"
      style={{ animation: "voltrBadgeGlow 4s ease-in-out infinite" }}
    >
      {children}
    </div>
  );
}

function Track({ width, delay = 0 }: { width: string; delay?: number }) {
  return (
    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
        style={{ width }}
      />
      <div
        className="absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-[3px]"
        style={{ animation: `voltrFlow 3s linear infinite ${delay}s` }}
      />
    </div>
  );
}

const float = (d = 0): CSSProperties => ({
  animation: `voltrFloat 5s ease-in-out infinite ${d}s`,
});
const pulse = (d = 0): CSSProperties => ({
  animation: `voltrPulseLine 3s ease-in-out infinite ${d}s`,
});

/* ---------- illustrations ---------- */

function BuildIllustration() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#242a3e] to-[#0e121d] text-indigo-400 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)]"
        style={float()}
      >
        <CubeTransparentIcon className="h-6 w-6" />
      </div>
      <div
        className="h-5 w-px bg-gradient-to-b from-indigo-500 to-white/10 text-indigo-500"
        style={pulse()}
      />
      <div className="grid w-full grid-cols-3 gap-2">
        {["Web App", "SDK", "CLI"].map((label, i) => (
          <div
            key={label}
            className={`${CHIP} px-2 py-2 text-center text-[11px] text-gray-200`}
            style={float(i * 0.4)}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="mt-1">
        <Badge>
          <CheckCircleIcon className="h-3.5 w-3.5 text-indigo-400" />
          One vault · three surfaces
        </Badge>
      </div>
    </div>
  );
}

function AllocationIllustration() {
  const rows: [string, string, number][] = [
    ["Kamino", "46%", 0],
    ["Drift", "32%", 0.6],
    ["Jupiter", "22%", 1.2],
  ];
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3">
      <div className="flex items-center justify-center gap-2">
        <span className={`${CHIP} px-3 py-1.5 text-[11px] text-gray-200`}>
          Idle capital
        </span>
        <span className="text-indigo-400" style={pulse()}>
          →
        </span>
        <span className={`${CHIP} px-3 py-1.5 text-[11px] text-gray-200`}>
          Strategies
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map(([name, pct, delay]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs text-gray-300">{name}</span>
            <Track width={pct} delay={delay} />
            <span className="w-8 shrink-0 text-right text-[10px] text-gray-400">
              {pct}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-center">
        <Badge>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Rebalances on drift
        </Badge>
      </div>
    </div>
  );
}

function EconomicsIllustration() {
  const sliders: [string, string, number][] = [
    ["Mgmt fee", "1.0%", 28],
    ["Perf fee", "10%", 55],
    ["Capacity", "68%", 68],
  ];
  return (
    <div className="flex h-full w-full flex-col justify-center gap-4">
      <div className={`${CHIP} flex flex-col gap-3.5 p-4`}>
        {sliders.map(([label, value, pos]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="w-16 shrink-0 text-xs text-gray-300">{label}</span>
            <div className="relative h-1.5 flex-1 rounded-full bg-white/10">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                style={{ width: `${pos}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-gradient-to-b from-[#2a3047] to-[#11131f] shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
                style={{ left: `${pos}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[10px] text-gray-400">
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Badge>
          <CheckCircleIcon className="h-3.5 w-3.5 text-indigo-400" />
          High-water-mark accounting
        </Badge>
      </div>
    </div>
  );
}

/* ---------- card wrapper + data ---------- */

export type FeatureCardData = {
  title: string;
  copy: string;
  glow: "indigo" | "violet";
  illustration: ReactNode;
};

export function FeatureCard({ title, copy, glow, illustration }: FeatureCardData) {
  const glowClass = glow === "violet" ? "bg-violet-500/10" : "bg-indigo-500/10";
  return (
    <div className="group relative flex aspect-square flex-col overflow-hidden bg-[#0a0e18] p-8">
      <div
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:6px_6px] opacity-50"
        style={{ animation: "voltrShimmer 6s ease-in-out infinite" }}
      />
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full ${glowClass} blur-[80px]`}
        style={{ animation: "voltrDrift 12s ease-in-out infinite" }}
      />
      <div className="relative z-10 mb-4">
        <h3 className="mb-2 text-lg font-medium tracking-tight text-white">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-400">{copy}</p>
      </div>
      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        {illustration}
      </div>
    </div>
  );
}

export const coreFeatureCards: FeatureCardData[] = [
  {
    title: "Build your way",
    copy: "Create and manage vaults through the web app, the TypeScript SDK, or the Voltr CLI.",
    glow: "indigo",
    illustration: <BuildIllustration />,
  },
  {
    title: "Composable allocation",
    copy: "Deploy idle capital into strategies and rebalance across protocols as markets move.",
    glow: "violet",
    illustration: <AllocationIllustration />,
  },
  {
    title: "Configurable economics",
    copy: "Set fees, capacity, withdrawal behavior, and roles at launch, then tune as you grow.",
    glow: "indigo",
    illustration: <EconomicsIllustration />,
  },
];
