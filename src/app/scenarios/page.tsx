"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SlidersHorizontal, Play, Sparkles, TrendingUp, Wallet, CreditCard } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import { ScenarioSimulationResponse } from "@/types/financial";
import { useCurrency } from "@/components/currency-provider";

export default function ScenariosPage() {
  const { currency, exchangeRate, formatMoney } = useCurrency();
  const [horizonMonths, setHorizonMonths] = useState(36);
  const [incomeDelta, setIncomeDelta] = useState("5000000");
  const [expenseDelta, setExpenseDelta] = useState("-1000000");
  const [growthRate, setGrowthRate] = useState("25.0");
  const [newLoanAmount, setNewLoanAmount] = useState("0");
  const [newLoanRate, setNewLoanRate] = useState("18.0");
  const [newLoanTerm, setNewLoanTerm] = useState(24);
  const [windfall, setWindfall] = useState("0");

  const [result, setResult] = useState<ScenarioSimulationResponse | null>(null);

  const simulateMutation = useMutation({
    mutationFn: () =>
      api.simulateScenario({
        name: "Interactive What-If Scenario",
        horizon_months: horizonMonths,
        monthly_income_delta: incomeDelta || "0",
        monthly_expense_delta: expenseDelta || "0",
        asset_growth_rate_annual: growthRate || "7",
        new_loan_amount: newLoanAmount || "0",
        new_loan_rate_annual: newLoanRate || "6.5",
        new_loan_term_months: newLoanTerm,
        one_time_windfall: windfall || "0",
      }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  // Run initial baseline simulation on mount
  React.useEffect(() => {
    simulateMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = React.useMemo(() => {
    if (!result || !result.monthly_projections) return [];
    const factor = currency === "USD" ? 1 / exchangeRate : 1;
    return result.monthly_projections.map((p) => {
      const rawNw = parseFloat(p.projected_net_worth) || 0;
      const rawLiq = parseFloat(p.projected_liquid_cash) || 0;
      const rawLiab = parseFloat(p.projected_liabilities) || 0;
      return {
        month: `ماه ${p.month}`,
        netWorth: rawNw * factor,
        liquid: rawLiq * factor,
        liabilities: rawLiab * factor,
        rawNetWorth: rawNw,
        rawLiquid: rawLiq,
        rawLiabilities: rawLiab,
      };
    });
  }, [result, currency, exchangeRate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
              موتور شبیه‌سازی سناریوهای مالی (What-If)
            </h2>
          </div>
          <p className="text-xs text-[#9A9DA5] mt-1.5 pr-11">
            شبیه‌سازی تغییرات زندگی، تسهیلات جدید، ارتقای درآمد و بازدهی دارایی‌ها با محاسبات قطعی ریاضی
          </p>
        </div>

        <button
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] text-xs font-medium transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{simulateMutation.isPending ? "در حال محاسبه..." : "اجرای شبیه‌سازی"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Parameter Controls */}
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F0AE55]" />
            <span>پارامترهای ورودی سناریو</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-[#9A9DA5] mb-1.5">
                <span>افق زمانی شبیه‌سازی</span>
                <span className="font-semibold text-[#F0AE55] font-mono">
                  {horizonMonths} ماه ({Math.round(horizonMonths / 12)} سال)
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                step="6"
                value={horizonMonths}
                onChange={(e) => setHorizonMonths(parseInt(e.target.value))}
                className="w-full accent-[#F0AE55] cursor-pointer h-2 bg-[#1B1D21] border border-[#282A2F] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9A9DA5] mb-1.5">
                تغییر در درآمد ماهانه (تومان)
              </label>
              <input
                type="number"
                placeholder="+10000000 یا -5000000"
                value={incomeDelta}
                onChange={(e) => setIncomeDelta(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] font-medium font-mono focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9A9DA5] mb-1.5">
                تغییر در هزینه ماهانه (تومان)
              </label>
              <input
                type="number"
                placeholder="-3000000 یا +4000000"
                value={expenseDelta}
                onChange={(e) => setExpenseDelta(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] font-medium font-mono focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-[#9A9DA5] mb-1.5">
                بازدهی سالانه فرضی پورتفوی (%)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="25.0"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] font-medium font-mono focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
              />
            </div>

            <div className="pt-3 border-t border-[#282A2F]">
              <span className="block font-medium text-[#E8E8E8] mb-2.5">
                شبیه‌سازی وام و بدهی جدید
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-[#9A9DA5] text-[11px] mb-1">
                    اصل وام (تومان)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newLoanAmount}
                    onChange={(e) => setNewLoanAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[8px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] font-mono text-xs focus:outline-none focus:border-[#F0AE55]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#9A9DA5] text-[11px] mb-1">
                    نرخ سود (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="18.0"
                    value={newLoanRate}
                    onChange={(e) => setNewLoanRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[8px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] font-mono text-xs focus:outline-none focus:border-[#F0AE55]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#9A9DA5] text-[11px] mb-1">
                    مدت (ماه)
                  </label>
                  <input
                    type="number"
                    placeholder="24"
                    value={newLoanTerm}
                    onChange={(e) => setNewLoanTerm(parseInt(e.target.value) || 12)}
                    className="w-full px-2.5 py-1.5 rounded-[8px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] font-mono text-xs focus:outline-none focus:border-[#F0AE55]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#9A9DA5] mb-1.5">
                دریافت وجه نقد غیرمنتظره / پاداش (تومان یک‌باره)
              </label>
              <input
                type="number"
                placeholder="مثلاً 50000000"
                value={windfall}
                onChange={(e) => setWindfall(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] font-mono focus:outline-none focus:border-[#F0AE55] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Calculated Simulation Trajectory & Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Simulation Deltas */}
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#141518] border border-[#282A2F] rounded-[18px] p-4">
                <span className="text-[11px] font-medium text-[#9A9DA5]">
                  پیش‌بینی ارزش خالص نهایی
                </span>
                <div className="text-lg font-semibold text-[#E8E8E8] mt-1 font-mono">
                  {formatMoney(result.final_projected_net_worth)}
                </div>
                <span className="text-[11px] text-[#76A98C] font-medium block mt-0.5 font-mono">
                  +{formatMoney(result.net_worth_delta)} تغییر خالص
                </span>
              </div>

              <div className="bg-[#141518] border border-[#282A2F] rounded-[18px] p-4">
                <span className="text-[11px] font-medium text-[#9A9DA5]">
                  جریان نقدینگی ماهانه جدید
                </span>
                <div className="text-lg font-semibold text-[#E8E8E8] mt-1 font-mono">
                  {formatMoney(result.new_monthly_cashflow)}
                </div>
                <span className="text-[11px] text-[#9A9DA5] block mt-0.5 font-mono">
                  در برابر {formatMoney(result.baseline_monthly_cashflow)} پایه فعلی
                </span>
              </div>

              <div className="bg-[#141518] border border-[#282A2F] rounded-[18px] p-4">
                <span className="text-[11px] font-medium text-[#9A9DA5]">
                  قسط وام جدید ماهانه
                </span>
                <div className="text-lg font-semibold text-[#C77A82] mt-1 font-mono">
                  {formatMoney(result.new_loan_monthly_payment)}
                </div>
                <span className="text-[11px] text-[#9A9DA5] block mt-0.5">
                  تعهد بازپرداخت افزوده به اقساط
                </span>
              </div>
            </div>
          )}

          {/* Trajectory Area Chart */}
          <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 h-[360px]">
            <h4 className="text-sm font-semibold text-[#E8E8E8] mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#F0AE55]" />
              <span>مسیر رشد دارایی در افق {horizonMonths} ماهه</span>
            </h4>
            <p className="text-xs text-[#9A9DA5] mb-3">
              محاسبه قطعی بهره مرکب ریاضی بر مبنای پارامترهای انتخابی شما
            </p>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F0AE55" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F0AE55" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#282A2F"
                    opacity={0.5}
                    vertical={false}
                  />
                  <XAxis dataKey="month" stroke="#696D77" fontSize={11} tickLine={false} />
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
                    formatter={(_val: unknown, _name: any, item: any) => [
                      formatMoney(item?.payload?.rawNetWorth),
                      "ارزش خالص پیش‌بینی‌شده",
                    ]}
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
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#F0AE55"
                    strokeWidth={2}
                    fill="url(#projGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
