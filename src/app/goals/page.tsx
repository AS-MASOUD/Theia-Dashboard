"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, Calendar, Check, X, Loader2, Trash2, Target, AlertCircle, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { useConfirm } from "@/components/confirm-modal-provider";
import { GoalCategory } from "@/types/financial";

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const { formatMoney } = useCurrency();
  const { confirm } = useConfirm();

  // Fetch goal categories from backend
  const { data: goalCategories } = useQuery({
    queryKey: ["goal-categories"],
    queryFn: () => api.getGoalCategories(),
    staleTime: 5 * 60 * 1000,
  });

  // Derive labels mapping from backend data
  const CATEGORY_LABELS: Record<string, string> = useMemo(() => {
    if (!goalCategories) return {};
    return Object.fromEntries(goalCategories.map((c: GoalCategory) => [c.code, c.label]));
  }, [goalCategories]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("emergency_fund");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.getGoals(),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      setFormError(null);
      if (!name.trim()) throw new Error("لطفاً عنوان هدف مالی را وارد کنید.");
      const p = parseFloat(targetAmount);
      if (isNaN(p) || p <= 0) throw new Error("مبلغ هدف باید بزرگتر از صفر باشد.");

      const payload = {
        name: name.trim(),
        category,
        target_amount: p,
        current_amount: parseFloat(currentAmount) || 0,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        target_date: targetDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        currency: "TOMAN",
        status: "in_progress",
        notes: notes.trim() || undefined,
      };

      return api.createGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setIsAddOpen(false);
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setMonthlyContribution("");
      setNotes("");
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت هدف مالی";
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
              اهداف مالی و برنامه‌ریزی سرمایه
            </h2>
          </div>
          <p className="text-xs text-[#9A9DA5] mt-1.5 pr-11">
            ردیابی اهداف، پس‌انداز منظم ماهانه و پیش‌بینی زمان تحقق اهداف مالی با الگوریتم‌های هوشمند
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>هدف مالی جدید</span>
        </button>
      </div>

      {/* Goals Cards */}
      {isLoading ? (
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-12 text-center text-[#9A9DA5] text-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 text-[#F0AE55] animate-spin" />
          <span>در حال بارگذاری اهداف مالی...</span>
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const pct = parseFloat(goal.progress_percent) || 0;
            const isCompleted = pct >= 100;
            const targetNum = parseFloat(goal.target_amount) || 0;

            return (
              <div
                key={goal.id}
                className="bg-[#141518] border border-[#282A2F] hover:border-[#32343A] rounded-[22px] p-6 flex flex-col justify-between space-y-5 transition-colors relative group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-[8px] bg-[#1B1D21] border border-[#282A2F] text-[#9A9DA5]">
                      {CATEGORY_LABELS[goal.category?.toLowerCase()] || goal.category || "هدف مالی"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full font-mono border ${
                          isCompleted
                            ? "bg-[#76A98C]/10 text-[#76A98C] border-[#76A98C]/30"
                            : "bg-[#F0AE55]/10 text-[#F0AE55] border-[#F0AE55]/30"
                        }`}
                      >
                        {pct.toFixed(0)}% تکمیل
                      </span>
                      <button
                        onClick={async () => {
                          const isConfirmed = await confirm({
                            title: "حذف هدف مالی",
                            message: `آیا از حذف هدف «${goal.name}» مطمئن هستید؟`,
                            description: "این هدف و تمام سوابق پس‌انداز ماهانه مربوط به آن از سامانه حذف خواهد شد.",
                            confirmText: "حذف هدف",
                            cancelText: "انصراف",
                            variant: "danger",
                          });
                          if (isConfirmed) {
                            deleteMutation.mutate(goal.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-[8px] text-[#696D77] hover:text-[#C77A82] hover:bg-[#C77A82]/10 transition-colors cursor-pointer"
                        title="حذف هدف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-[#E8E8E8] mt-3.5">
                    {goal.name}
                  </h3>
                  {goal.notes && (
                    <p className="text-xs text-[#9A9DA5] mt-1 line-clamp-2 leading-relaxed">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Progress & Target Stats */}
                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-lg font-semibold text-[#E8E8E8]">
                      {formatMoney(goal.current_amount)}
                    </span>
                    <span className="text-xs text-[#9A9DA5]">
                      از {targetNum > 0 ? formatMoney(goal.target_amount) : "نامشخص"}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#1B1D21] border border-[#282A2F] rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#76A98C]"
                          : "bg-[#F0AE55]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#9A9DA5] pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="text-[#696D77]">فاصله:</span> {formatMoney(goal.remaining_amount)}
                    </span>
                    <span className="text-[#76A98C] font-medium">+{formatMoney(goal.monthly_contribution)} / ماه</span>
                  </div>
                </div>

                {/* Target & Projected Timeline */}
                <div className="pt-3.5 border-t border-[#282A2F] text-xs space-y-1.5 text-[#9A9DA5]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#696D77]">
                      <Calendar className="h-3.5 w-3.5 text-[#696D77]" />
                      موعد هدف:
                    </span>
                    <span className="font-medium text-[#E8E8E8] font-mono">
                      {goal.target_date ? formatDate(goal.target_date) : "—"}
                    </span>
                  </div>

                  {goal.projected_completion_date && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#9A9DA5]">
                        <Clock className="h-3.5 w-3.5 text-[#696D77]" />
                        پیش‌بینی زمان تحقق:
                      </span>
                      <span className="font-medium text-[#F0AE55] font-mono">
                        {formatDate(goal.projected_completion_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-12 text-center text-[#9A9DA5] text-xs space-y-4 max-w-lg mx-auto">
          <div className="h-10 w-10 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center mx-auto">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#E8E8E8]">هنوز هدف مالی ثبت نکرده‌اید</h4>
            <p className="text-[#9A9DA5] text-xs mt-1">با ثبت اولین هدف، مسیر رشد پس‌انداز و دستیابی به استقلال مالی خود را به وضوح دنبال کنید.</p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setIsAddOpen(true);
            }}
            className="px-3.5 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] font-medium text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت اولین هدف مالی</span>
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#141518] border border-[#282A2F] rounded-[22px] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#F0AE55]" />
                <h3 className="text-sm font-semibold text-[#E8E8E8]">
                  ثبت هدف مالی جدید
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-[8px] text-[#696D77] hover:text-[#E8E8E8] hover:bg-[#1B1D21] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-[12px] bg-[#C77A82]/10 border border-[#C77A82]/25 text-[#C77A82] text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#C77A82]" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-[#9A9DA5] mb-1.5">
                  عنوان هدف مالی
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً صندوق اضطراری، پیش‌پرداخت مسکن، خرید خودرو"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9A9DA5] mb-1.5">
                  دسته‌بندی هدف
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-medium transition-colors"
                >
                  {goalCategories?.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#141518] text-[#E8E8E8]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#9A9DA5] mb-1.5">
                  مبلغ کل هدف (تومان)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="مثلاً 100,000,000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-semibold font-mono text-xs transition-colors"
                />
                {targetAmount && !isNaN(parseFloat(targetAmount)) && (
                  <span className="text-[11px] text-[#F0AE55] mt-1.5 block font-mono">
                    معادل: {parseFloat(targetAmount).toLocaleString()} تومان
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#9A9DA5] mb-1.5">
                    موجودی فعلی (تومان)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#9A9DA5] mb-1.5">
                    واریزی ماهانه (تومان)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="مثلاً 5,000,000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#9A9DA5] mb-1.5">
                  تاریخ موعد تحقق (تارگت)
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block font-medium text-[#9A9DA5] mb-1.5">
                  یادداشت (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="توضیحات تکمیلی..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-[12px] border border-[#282A2F] text-[#9A9DA5] font-medium hover:bg-[#1B1D21] transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] font-medium flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>ثبت هدف مالی</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
