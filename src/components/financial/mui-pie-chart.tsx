"use client";

import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

export interface PieChartItem {
  id?: string | number;
  value: number;
  label?: string;
  color?: string;
}

export interface MuiPieChartProps {
  data?: PieChartItem[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cx?: number;
  cy?: number;
  width?: number;
  height?: number;
  hideLegend?: boolean;
  valueFormatter?: (item: { value: number }) => string;
  className?: string;
}

const DEFAULT_DEMO_DATA: PieChartItem[] = [
  { id: 1, value: 35, label: "سهام و صندوق‌ها", color: "#F0AE55" },
  { id: 2, value: 25, label: "طلا و سکه", color: "#B9823D" },
  { id: 3, value: 20, label: "نقدینگی و سپرده", color: "#76A98C" },
  { id: 4, value: 12, label: "ارزهای دیجیتال", color: "#88A9BC" },
  { id: 5, value: 8, label: "اوراق درآمد ثابت", color: "#C77A82" },
];

export function MuiPieChart({
  data = DEFAULT_DEMO_DATA,
  innerRadius = 30,
  outerRadius = 100,
  paddingAngle = 5,
  cornerRadius = 5,
  startAngle = -45,
  endAngle = 225,
  cx = 150,
  cy = 150,
  width = 300,
  height = 250,
  hideLegend = true,
  valueFormatter,
  className = "",
}: MuiPieChartProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <PieChart
        series={[
          {
            data,
            innerRadius,
            outerRadius,
            paddingAngle,
            cornerRadius,
            startAngle,
            endAngle,
            cx,
            cy,
            valueFormatter: valueFormatter
              ? (item: { value: number }) => (item ? valueFormatter(item) : "")
              : undefined,
          },
        ]}
        width={width}
        height={height}
        hideLegend={hideLegend}
      />
    </div>
  );
}

export { PieChart };
export default MuiPieChart;
