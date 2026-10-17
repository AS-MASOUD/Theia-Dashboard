"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Percent,
  CheckCircle2,
  Wallet,
  ShieldAlert,
  Calendar,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCurrency } from "@/components/currency-provider";
import { WealthTrajectoryDetailModal } from "@/components/financial/wealth-trajectory-detail-modal";
import { WealthTrajectoryResponse } from "@/types/financial";

type RangeKey = "1M" | "3M" | "6M" | "1Y";

interface RangeOption {
  key: RangeKey;
  label: string;
  historyDays: number;
  forecastMonths: number;
}

const RANGE_OPTIONS: RangeOption[] = [
  {
    key: "1M",
    label: "۱ماه",
    historyDays: 30,
    forecastMonths: 1,
  },
  {
    key: "3M",
    label: "۳ماه",
    historyDays: 90,
    forecastMonths: 3,
  },
  {
    key: "6M",
    label: "۶ماه",
    historyDays: 180,
    forecastMonths: 6,
  },
  {
    key: "1Y",
    label: "۱سال",
    historyDays: 365,
    forecastMonths: 12,
  },
];

export function WealthTrajectoryChart() {
  const { currency, exchangeRate, formatMoney } = useCurrency();
  const [selectedRange, setSelectedRange] = useState<RangeKey>("1M");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Series visibility toggles
  const [showNetWorth, setShowNetWorth] = useState(true);
  const [showInvestments, setShowInvestments] = useState(true);
  const [showLiabilities, setShowLiabilities] = useState(true);
  const [showSalary, setShowSalary] = useState(true);
  const [showAIPrediction, setShowAIPrediction] = useState(true);

  const activeRangeConfig = useMemo(
    () =>
      RANGE_OPTIONS.find((r) => r.key === selectedRange) || RANGE_OPTIONS[0],
    [selectedRange],
  );

  const { data: trajectoryData, isLoading } = useQuery({
    queryKey: [
      "wealth-trajectory",
      activeRangeConfig.historyDays,
      activeRangeConfig.forecastMonths,
    ],
    queryFn: () =>
      api.getWealthTrajectory({
        history_days: activeRangeConfig.historyDays,
        forecast_months: activeRangeConfig.forecastMonths,
      }),
  });

  const factor = currency === "USD" ? 1 / exchangeRate : 1;

  const timeline = trajectoryData?.timeline;

  // Format data points for chart
  const formattedData = useMemo(() => {
    if (!timeline) return [];

    return timeline.map((point) => {
      const rawLiab = Number(point.total_liabilities) || 0;
      const rawInv = Number(point.total_investments) || 0;
      const rawSalary = Number(point.salary_income) || 0;
      const rawNw = Number(point.net_worth) || 0;

      const row: Record<string, string | number | boolean | null | undefined> =
        {
          date: point.date,
          display_date: point.display_date,
          is_forecast: point.is_forecast,
          total_liabilities: rawLiab * factor,
          total_investments: rawInv * factor,
          salary_income: rawSalary * factor,
          net_worth: rawNw * factor,
          raw_liabilities: rawLiab,
          raw_investments: rawInv,
          raw_salary: rawSalary,
          raw_nw: rawNw,
        };

      if (point.is_forecast && showAIPrediction) {
        if (point.forecast_confidence_upper != null) {
          row.confidence_upper =
            Number(point.forecast_confidence_upper) * factor;
        }
        if (point.forecast_confidence_lower != null) {
          row.confidence_lower =
            Number(point.forecast_confidence_lower) * factor;
        }
      }

      return row;
    });
  }, [timeline, factor, showAIPrediction]);

  return (
    <>
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 flex flex-col justify-between min-h-[390px] relative overflow-hidden">
        {/* Top Header: Title + Detail View Button + Time Range selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#E8E8E8]">
                روند استهلاک بدهی‌ها و رشد سرمایه‌گذاری (Wealth Trajectory)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Detail View Button */}
            <Link
              href="/wealth-trajectory"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              title="مشاهده تک‌تک اقساط و دارایی‌ها"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>مشاهده جزئیات تفکیکی</span>
            </Link>

            {/* Range selector */}
            <div className="flex items-center gap-1 bg-[#1B1D21] border border-[#282A2F] p-1 rounded-xl text-xs font-medium">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedRange(opt.key)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedRange === opt.key
                      ? "bg-[rgba(240,174,85,0.12)] border border-[rgba(240,174,85,0.30)] text-[#F0AE55] font-medium"
                      : "text-[#9A9DA5] hover:text-[#E8E8E8]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Series Visibility Toggles & Quick Stats Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2 px-3 rounded-xl bg-[#101114] border border-[#282A2F] text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Aggregated Net Worth toggle (Default ON) */}
            <button
              onClick={() => setShowNetWorth(!showNetWorth)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showNetWorth
                  ? "bg-[rgba(240,174,85,0.12)] text-[#F0AE55] border border-[rgba(240,174,85,0.25)]"
                  : "bg-transparent text-[#9A9DA5] border border-transparent opacity-60"
              }`}
            >
              <Wallet className="h-3.5 w-3.5 text-[#F0AE55]" />
              <span>ارزش خالص (تجمیعی کل)</span>
              <span className="font-semibold text-[11px] font-mono" dir="ltr">
                {formatMoney(
                  Number(trajectoryData?.baseline_investments || 0) -
                    Number(trajectoryData?.baseline_liabilities || 0),
                )}
              </span>
            </button>

            {/* Investments toggle */}
            <button
              onClick={() => setShowInvestments(!showInvestments)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showInvestments
                  ? "bg-[#76A98C]/12 text-[#76A98C] border border-[#76A98C]/25"
                  : "bg-transparent text-[#9A9DA5] border border-transparent opacity-60"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-[#76A98C]" />
              <span>کل سرمایه‌گذاری‌ها (صعودی)</span>
              <span className="font-semibold text-[11px] font-mono" dir="ltr">
                {formatMoney(trajectoryData?.baseline_investments)}
              </span>
            </button>

            {/* Liabilities toggle */}
            <button
              onClick={() => setShowLiabilities(!showLiabilities)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showLiabilities
                  ? "bg-[#C77A82]/12 text-[#C77A82] border border-[#C77A82]/25"
                  : "bg-transparent text-[#9A9DA5] border border-transparent opacity-60"
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5 text-[#C77A82]" />
              <span>کل بدهی‌ها و اقساط (نزولی)</span>
              <span className="font-semibold text-[11px] font-mono" dir="ltr">
                {formatMoney(trajectoryData?.baseline_liabilities)}
              </span>
            </button>

            {/* Salary toggle */}
            <button
              onClick={() => setShowSalary(!showSalary)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showSalary
                  ? "bg-[#88A9BC]/12 text-[#88A9BC] border border-[#88A9BC]/25"
                  : "bg-transparent text-[#9A9DA5] border border-transparent opacity-60"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#88A9BC]" />
              <span>حقوق و دریافتی ماهانه</span>
              <span className="font-semibold text-[11px] font-mono" dir="ltr">
                {formatMoney(trajectoryData?.baseline_salary)}
              </span>
            </button>

            {/* AI Prediction toggle */}
            <button
              onClick={() => setShowAIPrediction(!showAIPrediction)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showAIPrediction
                  ? "bg-[#B9823D]/12 text-[#B9823D] border border-[#B9823D]/25"
                  : "bg-transparent text-[#9A9DA5] border border-transparent opacity-60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#B9823D]" />
              <span>بازه تخمین آینده AI</span>
            </button>
          </div>
        </div>

        {/* Main Chart Canvas */}
        <div className="w-full h-[280px] sm:h-[320px] mt-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
              در حال بارگذاری شبیه‌سازی مالی هوش مصنوعی...
            </div>
          ) : formattedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#9A9DA5]">
              داده‌ای جهت رسم نمودار مسیر مالی یافت نشد.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0AE55" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F0AE55" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient
                    id="invConfidenceGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#76A98C" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#76A98C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="liabAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C77A82" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#C77A82" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="display_date"
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

                {/* Milestone Reference Line for "امروز" */}
                <ReferenceLine
                  x="امروز"
                  stroke="#B9823D"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "امروز (شروع پیش‌بینی)",
                    fill: "#B9823D",
                    fontSize: 11,
                    position: "top",
                  }}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0]?.payload;
                      const isForecast = row?.is_forecast;

                      return (
                        <div
                          className="bg-[#1B1D21] text-[#E8E8E8] p-3 rounded-2xl shadow-xl text-xs space-y-1.5 border border-[#282A2F] text-right min-w-[210px]"
                          dir="rtl"
                        >
                          <div className="flex items-center justify-between border-b border-[#282A2F] pb-1">
                            <span className="font-medium text-[#E8E8E8]">
                              {label} ({row?.date})
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isForecast
                                  ? "bg-[rgba(240,174,85,0.12)] text-[#F0AE55] border border-[rgba(240,174,85,0.25)]"
                                  : "bg-[#141518] text-[#9A9DA5] border border-[#282A2F]"
                              }`}
                            >
                              {isForecast ? "پیش‌بینی آینده" : "تاریخچه"}
                            </span>
                          </div>

                          {showNetWorth && (
                            <div className="text-[#F0AE55] flex items-center justify-between font-semibold pt-0.5 pb-1 border-b border-[#282A2F]">
                              <span>ارزش خالص (تجمیعی کل):</span>
                              <span dir="ltr">{formatMoney(row?.raw_nw)}</span>
                            </div>
                          )}

                          {showInvestments && (
                            <div className="text-[#76A98C] flex items-center justify-between font-medium">
                              <span>سرمایه‌گذاری‌ها:</span>
                              <span dir="ltr">
                                {formatMoney(row?.raw_investments)}
                              </span>
                            </div>
                          )}

                          {showLiabilities && (
                            <div className="text-[#C77A82] flex items-center justify-between font-medium">
                              <span>بدهی‌ها و اقساط:</span>
                              <span dir="ltr">
                                {formatMoney(row?.raw_liabilities)}
                              </span>
                            </div>
                          )}

                          {showSalary && (
                            <div className="text-[#88A9BC] flex items-center justify-between font-medium">
                              <span>حقوق ماهانه:</span>
                              <span dir="ltr">
                                {formatMoney(row?.raw_salary)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Aggregated Net Worth (تجمیعی کل) Area & Line */}
                {showNetWorth && (
                  <Area
                    type="monotone"
                    dataKey="net_worth"
                    stroke="#F0AE55"
                    strokeWidth={2}
                    fill="url(#netWorthGrad)"
                  />
                )}

                {/* AI Confidence Band */}
                {showAIPrediction && showInvestments && (
                  <Area
                    type="monotone"
                    dataKey="confidence_upper"
                    stroke="transparent"
                    fill="url(#invConfidenceGrad)"
                  />
                )}

                {/* Total Liabilities Area & Line (Descending) */}
                {showLiabilities && (
                  <Area
                    type="monotone"
                    dataKey="total_liabilities"
                    stroke="#C77A82"
                    strokeWidth={2}
                    fill="url(#liabAreaGrad)"
                  />
                )}

                {/* Total Investments Line (Ascending) */}
                {showInvestments && (
                  <Line
                    type="monotone"
                    dataKey="total_investments"
                    stroke="#76A98C"
                    strokeWidth={2}
                    dot={false}
                  />
                )}

                {/* Salary Baseline Line */}
                {showSalary && (
                  <Line
                    type="monotone"
                    dataKey="salary_income"
                    stroke="#88A9BC"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom Key Milestones Strip */}
        <div className="mt-3 pt-3 border-t border-[#282A2F] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#9A9DA5]">
            <Clock className="h-4 w-4 text-[#C77A82] shrink-0" />
            <span>
              تسویه کامل بدهی‌ها:{" "}
              <strong className="text-[#E8E8E8] font-semibold">
                {trajectoryData?.debt_free_date || "در مسیر کاهش"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#9A9DA5]">
            <Percent className="h-4 w-4 text-[#76A98C] shrink-0" />
            <span>
              سود مرکب پیش‌بینی‌شده:{" "}
              <strong
                className="text-[#76A98C] font-semibold"
                dir="ltr"
              >
                +{formatMoney(trajectoryData?.projected_total_profit)}
              </strong>
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-[#9A9DA5]">
            <Link
              href="/wealth-trajectory"
              className="text-xs font-medium text-[#F0AE55] hover:text-[#F5BA6E] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>مشاهده ریز محاسبات و جدول تفکیکی</span>
              <span aria-hidden="true">&larr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {trajectoryData && (
        <WealthTrajectoryDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={trajectoryData}
          selectedRange={selectedRange}
        />
      )}
    </>
  );
}
