import React, { useState, useMemo } from "react";
import HoldersChart from "./allocations-chart";
import tailwindConfigFile from "../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const tailwindConfig = resolveConfig(tailwindConfigFile) as any;

interface Allocation {
  orgName: string;
  strategyDescription: string;
  positionValue: number;
  tokenName: string;
}

interface AllocationCardProps {
  vaultTotalValue: number;
  allocations: Allocation[];
}

interface AllocationDisplay {
  name: string;
  ratio: number;
}

export default function AllocationsCard({
  allocations,
  vaultTotalValue,
}: AllocationCardProps) {
  const allocationUnfilteredDisplay: AllocationDisplay[] = [
    {
      name: "Vault Reserve",
      ratio:
        (vaultTotalValue -
          allocations.reduce(
            (acc, allocation) => acc + allocation.positionValue,
            0
          )) /
        vaultTotalValue,
    },
    ...allocations.map((allocation) => ({
      name:
        allocation.orgName +
        " " +
        allocation.strategyDescription +
        (allocation.tokenName ? ` (${allocation.tokenName})` : ""),
      ratio: allocation.positionValue / vaultTotalValue,
    })),
  ];

  // Sort all allocations by ratio (highest to lowest)
  const sortedAllocationUnfilteredDisplay = allocationUnfilteredDisplay.sort(
    (a, b) => b.ratio - a.ratio
  );

  // Separate allocations into significant (≥1%) and small (<1%) groups
  const significantAllocations = sortedAllocationUnfilteredDisplay.filter(
    (allocation) => allocation.ratio >= 0.0099
  );

  const smallAllocations = sortedAllocationUnfilteredDisplay.filter(
    (allocation) => allocation.ratio < 0.0099
  );

  // Calculate the sum of all small allocations
  const otherRatio = smallAllocations.reduce(
    (sum, allocation) => sum + allocation.ratio,
    0
  );

  // Create the final allocation display array
  const allocationDisplay: AllocationDisplay[] = [...significantAllocations];

  // Add the "Other" category if there are any small allocations
  if (otherRatio >= 0.0099) {
    allocationDisplay.push({
      name: "Other",
      ratio: otherRatio,
    });
  }

  const [allocationsState] = useState<AllocationDisplay[]>(allocationDisplay);

  const colors = [
    tailwindConfig.theme.colors.violet[500],
    tailwindConfig.theme.colors.indigo[500],
    tailwindConfig.theme.colors.teal[500],
    tailwindConfig.theme.colors.pink[500],
    tailwindConfig.theme.colors.orange[500],
    tailwindConfig.theme.colors.sky[500],
    tailwindConfig.theme.colors.yellow[500],
    tailwindConfig.theme.colors.fuchsia[500],
    tailwindConfig.theme.colors.green[500],
    tailwindConfig.theme.colors.red[500],
    tailwindConfig.theme.colors.blue[500],
    tailwindConfig.theme.colors.gray[500],
  ];

  const hoverColors = [
    tailwindConfig.theme.colors.violet[600],
    tailwindConfig.theme.colors.indigo[600],
    tailwindConfig.theme.colors.teal[600],
    tailwindConfig.theme.colors.pink[600],
    tailwindConfig.theme.colors.orange[600],
    tailwindConfig.theme.colors.sky[600],
    tailwindConfig.theme.colors.yellow[600],
    tailwindConfig.theme.colors.fuchsia[600],
    tailwindConfig.theme.colors.green[600],
    tailwindConfig.theme.colors.red[600],
    tailwindConfig.theme.colors.blue[600],
    tailwindConfig.theme.colors.gray[600],
  ];

  const chartData = useMemo(
    () => ({
      labels: allocationsState.map((allocation) => allocation.name),
      datasets: [
        {
          label: "% owned",
          data: allocationsState.map((allocation) => allocation.ratio * 100),
          backgroundColor: allocationsState.map(
            (_allocation, idx) => colors[idx]
          ),
          hoverBackgroundColor: allocationsState.map(
            (_allocation, idx) => hoverColors[idx]
          ),
          borderWidth: 0,
        },
      ],
    }),
    [allocationsState]
  );

  return (
    <div className="col-span-full md:col-span-4 bg-gray-900 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-slate-700/60">
        <h2 className="font-semibold text-gray-100">Current Allocations</h2>
      </header>

      {/* Main content area with responsive layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
        {/* Chart section */}
        <div className="w-full md:w-1/2">
          <HoldersChart data={chartData} width={224} height={224} />
        </div>

        {/* Legend section */}
        <div className="w-full md:w-1/2 md:pl-4">
          <ul className="space-y-1">
            {allocationsState.length > 0 &&
              allocationsState.map((allocation, idx) => (
                <li className="flex px-2" key={idx}>
                  <div
                    className="w-2 h-2 rounded-full shrink-0 my-2 mr-3"
                    style={{ backgroundColor: colors[idx] }}
                  />
                  <div className="grid grid-cols-12 gap-2 items-center py-0.5 text-sm w-full">
                    <div className="col-span-8">
                      <p className="font-medium text-gray-100 truncate">
                        {allocation.name}
                      </p>
                    </div>
                    <div className="col-span-4 text-right truncate">
                      <span className="font-medium text-gray-300">
                        {allocation.ratio > 0.01
                          ? (allocation.ratio * 100).toFixed(1)
                          : (allocation.ratio * 100).toPrecision(2)}
                        %
                      </span>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
