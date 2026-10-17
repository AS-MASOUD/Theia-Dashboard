"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, ShieldCheck, Activity, PieChart, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

export default function AnalyticsPage() {
  const { formatMoney } = useCurrency();

  const { data: snapshots } = useQuery({
    queryKey: ["analytics-snapshots-full"],
    queryFn: () => api.getSnapshots(90),
  });

  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  const formattedSnapshots = React.useMemo(() => {
    if (!snapshots) return [];
    return snapshots.map((s) => ({
      date: formatDate(s.snapshot_date),
      netWorth: parseFloat(s.net_worth),
      assets: parseFloat(s.total_assets),
      liabilities: parseFloat(s.total_liabilities),
      liquid: parseFloat(s.liquid_assets),
    }));
  }, [snapshots]);

  const debtToAssetRatio = React.useMemo(() => {
    if (!overview || parseFloat(overview.total_assets) === 0) return 0;
    return (
      (parseFloat(overview.total_liabilities) / parseFloat(overview.total_assets)) *
      100
    );
  }, [overview]);

  const liquidRatio = React.useMemo(() => {
    if (!overview || parseFloat(overview.total_assets) === 0) return 0;
    return (
      (parseFloat(overview.liquid_cash) / parseFloat(overview.total_assets)) * 100
    );
  }, [overview]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
            تحلیل‌های آماری و نسبت‌های سلامت مالی
          </h2>
        </div>
        <p className="text-xs text-[#9A9DA5] mt-1.5 pr-11">
          روند انبساط ترازنامه، کفایت نقدینگی و شاخص‌های سلامت ساختار بدهی و دارایی
        </p>
      </div>

      {/* Financial Health Ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Debt to Asset */}
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              نسبت بدهی به دارایی
            </span>
            <div className="h-7 w-7 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#C77A82] flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div
            className={`text-xl font-semibold mt-2 font-mono ${
              debtToAssetRatio > 50
                ? "text-[#C77A82]"
                : "text-[#E8E8E8]"
            }`}
          >
            {debtToAssetRatio.toFixed(1)}%
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1 block">
            {debtToAssetRatio < 40 ? "اهرم مالی محتاطانه و ایمن" : "اهرم مالی در حد متوسط"}
          </span>
        </div>

        {/* Card 2: Liquid Buffer */}
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              شاخص بافر نقدینگی
            </span>
            <div className="h-7 w-7 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#88A9BC] flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-semibold text-[#88A9BC] mt-2 font-mono">
            {liquidRatio.toFixed(1)}%
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1 block">
            سهم نقدینگی در دسترس از کل دارایی‌ها
          </span>
        </div>

        {/* Card 3: Productive Investments */}
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              عمق سرمایه‌گذاری مولد
            </span>
            <div className="h-7 w-7 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#76A98C] flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-semibold text-[#76A98C] mt-2 font-mono">
            {(100 - liquidRatio).toFixed(1)}%
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1 block">
            دارایی‌های زاینده با بهره مرکب
          </span>
        </div>

        {/* Card 4: DTI */}
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              سهم اقساط از درآمد (DTI)
            </span>
            <div className="h-7 w-7 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
              <PieChart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-xl font-semibold text-[#E8E8E8] mt-2 font-mono">
            {overview && parseFloat(overview.monthly_income) > 0
              ? `${(
                  (parseFloat(overview.monthly_debt_service) /
                    parseFloat(overview.monthly_income)) *
                  100
                ).toFixed(1)}%`
              : "0%"}
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1 block">
            تعهد بازپرداخت بدهی نسبت به حقوق
          </span>
        </div>
      </div>

      {/* Dual Comparative Historical Chart */}
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#E8E8E8] mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F0AE55]" />
            <span>انبساط ترازنامه مالی (روند ۹۰ روز گذشته)</span>
          </h3>
          <p className="text-xs text-[#9A9DA5]">
            مقایسه تاریخی کل دارایی‌ها در برابر بدهی‌ها و ارزش خالص دارایی
          </p>
        </div>

        <div className="h-[380px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedSnapshots}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#282A2F"
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#696D77"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#696D77"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  `${val >= 1000000 ? (val / 1000000).toFixed(0) + " م.ت" : val.toFixed(0)}`
                }
              />
              <Tooltip
                formatter={(val: unknown) => [formatMoney(Number(val)), ""]}
                contentStyle={{
                  backgroundColor: "#141518",
                  borderColor: "#282A2F",
                  borderRadius: "14px",
                  fontSize: "12px",
                  color: "#E8E8E8",
                  direction: "rtl",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="assets"
                name="کل دارایی‌ها"
                stroke="#76A98C"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                name="ارزش خالص دارایی"
                stroke="#F0AE55"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="liabilities"
                name="کل بدهی‌ها"
                stroke="#C77A82"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
