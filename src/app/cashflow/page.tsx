"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

export default function CashFlowPage() {
  const { currency, exchangeRate, formatMoney } = useCurrency();

  const { data: summary } = useQuery({
    queryKey: ["cashflow-summary"],
    queryFn: () => api.getCashflowSummary(),
  });

  const { data: categories } = useQuery({
    queryKey: ["cashflow-categories"],
    queryFn: () => api.getCategories(),
  });

  const { data: entries } = useQuery({
    queryKey: ["cashflow-entries"],
    queryFn: () => api.getEntries(50),
  });

  const totalIncome = summary ? parseFloat(summary.total_income) : 0;
  const totalExpenses = summary ? parseFloat(summary.total_expenses) : 0;
  const netSavings = summary ? parseFloat(summary.net_savings) : 0;
  const savingsRate = summary ? parseFloat(summary.savings_rate_percent) : 0;

  const expenseBreakdown = React.useMemo(() => {
    if (!summary?.categories_breakdown) return [];
    const factor = currency === "USD" ? 1 / exchangeRate : 1;
    return summary.categories_breakdown
      .filter((c) => c.flow_type === "expense")
      .map((c) => ({
        ...c,
        scaledAmount: c.amount * factor,
        rawAmount: c.amount,
      }));
  }, [summary, currency, exchangeRate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100">
          جریان نقدینگی و بودجه‌بندی هزینه‌ها
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          ورودی درآمدها، مصارف معیشتی و مازاد خالص قابل پس‌انداز یا سرمایه‌گذاری
        </p>
      </div>

      {/* Cash Flow Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="obsidian-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              کل ورودی‌های ماهانه
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
          </div>
          <div className="text-xl font-semibold text-[#76A98C] font-mono tracking-tight">
            {formatMoney(totalIncome)}
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1.5 block">
            حقوق، سود نقدی و عایدات سرمایه
          </span>
        </div>

        <div className="obsidian-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              کل مخارج و مصارف ماهانه
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#C77A82]" />
          </div>
          <div className="text-xl font-semibold text-[#C77A82] font-mono tracking-tight">
            {formatMoney(totalExpenses)}
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1.5 block">
            هزینه‌های معیشتی و تعهدات دوره‌ای
          </span>
        </div>

        <div className="obsidian-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              مازاد خالص پس‌انداز
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F0AE55]" />
          </div>
          <div
            className={`text-xl font-semibold font-mono tracking-tight ${
              netSavings >= 0 ? "text-[#F0AE55]" : "text-[#C77A82]"
            }`}
          >
            {formatMoney(netSavings)}
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1.5 block">
            نقدینگی در دسترس برای سرمایه‌گذاری
          </span>
        </div>

        <div className="obsidian-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              نرخ پس‌انداز ماهانه
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#88A9BC]" />
          </div>
          <div className="text-xl font-semibold text-[#E8E8E8] font-mono tracking-tight">
            {savingsRate.toFixed(1)}%
          </div>
          <span className="text-xs text-[#9A9DA5] mt-1.5 block">
            درصد نگهداری‌شده از کل درآمد
          </span>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 obsidian-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                توزیع مخارج بر حسب سرفصل هزینه‌کرد
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحلیل مصارف جاری در دسته‌بندی‌های مختلف
              </p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {expenseBreakdown && expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseBreakdown}
                  margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="category"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
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
                      formatMoney(item?.payload?.rawAmount),
                      "هزینه‌شده",
                    ]}
                    contentStyle={{
                      backgroundColor: "#12151e",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      color: "#fff",
                      direction: "rtl",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Bar dataKey="scaledAmount" radius={[6, 6, 0, 0]}>
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                هیچ ورودی هزینه‌ای در این بازه زمانی ثبت نشده است.
              </div>
            )}
          </div>
        </div>

        {/* Budgets List */}
        <div className="obsidian-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              سرفصل‌های بودجه‌بندی
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              دسته‌بندی‌های فعال مدیریت مصارف
            </p>

            <div className="space-y-2.5 overflow-y-auto max-h-[250px] pe-1">
              {categories?.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs hover:border-amber-500/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color_hex }}
                    />
                    <span className="font-semibold text-slate-200">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    {cat.flow_type === "income" ? "درآمد" : "هزینه"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cashflow Entries Table */}
      <div className="obsidian-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            ریز اقلام اخیر جریان نقدینگی
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-6 font-semibold text-start">شرح تراکنش</th>
                <th className="py-3 px-4 font-semibold text-start">دسته‌بندی</th>
                <th className="py-3 px-4 font-semibold text-start">تاریخ</th>
                <th className="py-3 px-4 font-semibold text-center">ماهیت</th>
                <th className="py-3 px-6 font-semibold text-end">مبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries && entries.length > 0 ? (
                entries.map((entry) => {
                  const isIncome = entry.flow_type === "income";

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-6 font-medium text-slate-100">
                        {entry.description}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                          {entry.category_color && (
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: entry.category_color }}
                            />
                          )}
                          {entry.category_name || "دسته‌بندی‌نشده"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {formatDate(entry.entry_date)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            entry.is_recurring
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-white/5 text-slate-400 border-white/5"
                          }`}
                        >
                          {entry.is_recurring ? "تکرارشونده" : "یک‌باره"}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-end font-bold text-sm font-mono">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-400"
                              : "text-slate-200"
                          }
                        >
                          {isIncome ? "+" : "-"}
                          {formatMoney(entry.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    هیچ ورودی جریان نقدینگی فعالی برای حساب شما ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
