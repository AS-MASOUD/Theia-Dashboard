"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

const TYPE_LABELS: Record<string, string> = {
  ALL: "همه تراکنش‌ها",
  DEPOSIT: "واریز نقدی",
  WITHDRAWAL: "برداشت نقدی",
  BUY: "خرید دارایی",
  SELL: "فروش دارایی",
  DIVIDEND: "سود نقدی / توزیع سود",
};

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const { formatMoney } = useCurrency();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.getTransactions(100),
  });

  const filtered = React.useMemo(() => {
    if (!transactions) return [];
    if (filterType === "ALL") return transactions;
    return transactions.filter((t) => t.transaction_type === filterType);
  }, [transactions, filterType]);

  const types = ["ALL", "DEPOSIT", "WITHDRAWAL", "BUY", "SELL", "DIVIDEND"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">
            دفتر کل تراکنش‌های مالی
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            سوابق حسابداری کامل واریزها، برداشت‌ها، معاملات و دریافت سودهای نقدی
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#1B1D21] border border-[#282A2F] p-1 rounded-[12px] text-xs font-medium overflow-x-auto max-w-full">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-[8px] transition-colors shrink-0 cursor-pointer ${
                filterType === t
                  ? "bg-[#F0AE55]/15 text-[#F0AE55] border border-[#F0AE55]/30 font-medium"
                  : "text-[#9A9DA5] hover:text-[#E8E8E8]"
              }`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="obsidian-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#1B1D21] text-[#9A9DA5] uppercase tracking-wider border-b border-[#282A2F]">
              <tr>
                <th className="py-3 px-6 font-medium text-start">نوع عملیات</th>
                <th className="py-3 px-4 font-medium text-start">تاریخ</th>
                <th className="py-3 px-4 font-medium text-end">تعداد / حجم</th>
                <th className="py-3 px-4 font-medium text-end">نرخ واحد</th>
                <th className="py-3 px-4 font-medium text-end">کارمزد</th>
                <th className="py-3 px-6 font-medium text-end">مبلغ کل تراکنش</th>
                <th className="py-3 px-4 font-medium text-center">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282A2F]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9A9DA5]">
                    در حال بارگذاری سوابق تراکنش‌ها...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9A9DA5]">
                    هیچ تراکنشی مطابق با فیلتر انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isPositiveFlow =
                    tx.transaction_type === "DEPOSIT" ||
                    tx.transaction_type === "SELL" ||
                    tx.transaction_type === "DIVIDEND";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#1B1D21]/30 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-[8px] shrink-0 border ${
                              isPositiveFlow
                                ? "bg-[#76A98C]/10 text-[#76A98C] border-[#76A98C]/20"
                                : "bg-[#C77A82]/10 text-[#C77A82] border-[#C77A82]/20"
                            }`}
                          >
                            {isPositiveFlow ? (
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {TYPE_LABELS[tx.transaction_type] || tx.transaction_type}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300 font-mono">
                        {formatDate(tx.transaction_date)}
                      </td>

                      <td className="py-3.5 px-4 text-end text-slate-300 font-mono">
                        {tx.quantity ? parseFloat(tx.quantity).toLocaleString("en-US") : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-end text-slate-400 font-mono">
                        {tx.unit_price ? formatMoney(tx.unit_price) : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-end text-slate-400 font-mono">
                        {parseFloat(tx.fee) > 0 ? formatMoney(tx.fee) : "—"}
                      </td>

                      <td className="py-3.5 px-6 text-end font-bold text-sm font-mono">
                        <span
                          className={
                            isPositiveFlow
                              ? "text-emerald-400"
                              : "text-slate-200"
                          }
                        >
                          {isPositiveFlow ? "+" : "-"}
                          {formatMoney(tx.total_amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                          تسویه شده
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
