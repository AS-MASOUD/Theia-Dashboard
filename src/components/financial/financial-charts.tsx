"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart } from "@mui/x-charts/PieChart";

import { useCurrency } from "@/components/currency-provider";

interface NetWorthChartProps {
  data: Array<{
    snapshot_date: string;
    net_worth: string | number;
    total_assets: string | number;
    total_liabilities: string | number;
  }>;
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const [range, setRange] = useState<"30D" | "90D" | "ALL">("90D");
  const { currency, exchangeRate, formatMoney } = useCurrency();

  const formattedData = React.useMemo(() => {
    if (!data) return [];
    let slice = [...data];
    if (range === "30D") slice = slice.slice(-10);
    else if (range === "90D") slice = slice.slice(-30);

    const factor = currency === "USD" ? 1 / exchangeRate : 1;

    return slice.map((item) => {
      const rawNw = typeof item.net_worth === "string" ? parseFloat(item.net_worth) : item.net_worth || 0;
      const rawAssets = typeof item.total_assets === "string" ? parseFloat(item.total_assets) : item.total_assets || 0;
      const rawLiab = typeof item.total_liabilities === "string" ? parseFloat(item.total_liabilities) : item.total_liabilities || 0;

      return {
        date: item.snapshot_date ? item.snapshot_date.slice(5) : "",
        netWorth: rawNw * factor,
        assets: rawAssets * factor,
        liabilities: rawLiab * factor,
        rawNetWorth: rawNw,
        rawAssets: rawAssets,
        rawLiabilities: rawLiab,
      };
    });
  }, [data, range, currency, exchangeRate]);

  return (
    <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 flex flex-col justify-between h-[360px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#E8E8E8]">
            روند ارزش خالص (Net Worth)
          </h3>
          <p className="text-xs text-[#9A9DA5] font-normal">
            سیر تاریخی تغییرات ارزش پورتفولیو و تعهدات بدهی
          </p>
        </div>

        {/* Time range pills */}
        <div className="flex items-center gap-1 bg-[#1B1D21] p-1 rounded-xl border border-[#282A2F] text-xs font-medium">
          {[
            { label: "۳۰ روزه", value: "30D" as const },
            { label: "۹۰ روزه", value: "90D" as const },
            { label: "کل دوره", value: "ALL" as const },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-lg transition-colors text-xs font-medium cursor-pointer ${
                range === r.value
                  ? "bg-[rgba(240,174,85,0.12)] border border-[rgba(240,174,85,0.30)] text-[#F0AE55]"
                  : "text-[#9A9DA5] hover:text-[#E8E8E8]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        {formattedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#9A9DA5]">
            هنوز اسنپ‌شات تاریخی ثبت نشده است.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F0AE55" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F0AE55" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#696D77"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#696D77"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  currency === "USD"
                    ? `$${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val.toFixed(0)}`
                    : `${val >= 1000000 ? (val / 1000000).toFixed(0) + " م.ت" : val >= 1000 ? (val / 1000).toFixed(0) + " ه.ت" : val.toFixed(0)}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0]?.payload;
                    return (
                      <div className="bg-[#1B1D21] text-[#E8E8E8] p-3 rounded-2xl shadow-xl text-xs space-y-1.5 border border-[#282A2F] text-right" dir="rtl">
                        <div className="font-medium text-[#F0AE55]">{label}</div>
                        <div className="text-[#E8E8E8] font-semibold font-number">
                          ارزش خالص: {formatMoney(row?.rawNetWorth)}
                        </div>
                        {row?.rawAssets !== undefined && (
                          <div className="text-[#76A98C] font-number">
                            کل دارایی‌ها: {formatMoney(row?.rawAssets)}
                          </div>
                        )}
                        {row?.rawLiabilities !== undefined && (
                          <div className="text-[#C77A82] font-number">
                            کل بدهی‌ها: {formatMoney(row?.rawLiabilities)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#F0AE55"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#netWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const ALLOCATION_COLORS = [
  "#F0AE55", // Warm Amber
  "#B9823D", // Muted Bronze
  "#76A98C", // Soft Sage
  "#88A9BC", // Slate Blue
  "#3A3E47", // Charcoal Gray
  "#C77A82", // Muted Rose
  "#D4A373", // Warm Sand
];

const CATEGORY_FA: Record<string, string> = {
  Cash: "نقدینگی و پس‌انداز",
  Equity: "سهام و صندوق‌ها",
  Crypto: "ارزهای دیجیتال",
  Commodity: "کالا و طلا",
  "Fixed Income": "اوراق درآمد ثابت",
  "Real Estate": "املاک و مستغلات",
  Other: "سایر دارایی‌ها",
  equity: "سهام و صندوق‌ها",
  crypto: "ارزهای دیجیتال",
  cash: "نقدینگی و پس‌انداز",
  commodity: "کالا و طلا",
  fixed_income: "اوراق درآمد ثابت",
  real_estate: "املاک و مستغلات",
};

interface AllocationDonutProps {
  data: Array<{ category: string; amount: number; percentage: number }>;
}

export function AllocationDonut({ data }: AllocationDonutProps) {
  const chartData = data && data.length > 0 ? data : [];
  const { formatMoney } = useCurrency();

  const pieSeriesData = React.useMemo(() => {
    return chartData.map((item, index) => ({
      id: `${item.category}-${index}`,
      value: item.amount,
      label: CATEGORY_FA[item.category] || item.category,
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    }));
  }, [chartData]);

  return (
    <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-sm font-semibold text-[#E8E8E8]">
          ترکیب و تخصیص دارایی‌ها
        </h3>
        <p className="text-xs text-[#9A9DA5] font-normal">
          توزیع سرمایه میان طبقات دارایی و پوزیشن‌ها
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[#9A9DA5]">
          دارایی یا پوزیشنی جهت نمایش ثبت نشده است.
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 mt-2">
          <div className="w-[300px] h-[250px] shrink-0 flex items-center justify-center">
            <PieChart
              series={[
                {
                  data: pieSeriesData,
                  innerRadius: 30,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                  startAngle: -45,
                  endAngle: 225,
                  cx: 150,
                  cy: 150,
                  valueFormatter: (item: { value: number }) =>
                    item ? formatMoney(item.value) : "",
                },
              ]}
              width={300}
              height={250}
              hideLegend
            />
          </div>

          {/* Clean Categorical Legend */}
          <div className="flex-1 w-full space-y-1.5 overflow-y-auto max-h-[190px] ps-1">
            {chartData.map((item, idx) => (
              <div
                key={item.category}
                className="flex items-center justify-between text-xs py-1.5 border-b border-[#282A2F]/50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length],
                    }}
                  />
                  <span className="font-normal text-[#E8E8E8]">
                    {CATEGORY_FA[item.category] || item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#E8E8E8] font-number">
                    %{item.percentage.toFixed(1)}
                  </span>
                  <span className="text-[#9A9DA5] text-[11px] font-number">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
