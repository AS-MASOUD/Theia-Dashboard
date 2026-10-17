"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Edit3,
  Calendar,
  Percent,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  CreditCard,
  Building,
  Users,
  Coins,
  Receipt,
  PlusCircle,
  ChevronDown,
  History,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCurrency } from "@/components/currency-provider";
import { formatDate } from "@/lib/utils";
import { Liability, LiabilityPayment } from "@/types/financial";
import { LenderLogo, getLenderBrand } from "./lender-logo";
import { useUserPlatforms } from "@/hooks/use-user-platforms";

interface LiabilityDetailModalProps {
  liability: Liability | null;
  isOpen: boolean;
  onClose: () => void;
  liabilityTypes?: Array<{ id: string; label: string; defaultRate?: string; defaultTerm?: string }>;
  liabilityLabels?: Record<string, string>;
}

export function LiabilityDetailModal({
  liability,
  isOpen,
  onClose,
  liabilityTypes = [],
  liabilityLabels = {},
}: LiabilityDetailModalProps) {
  const queryClient = useQueryClient();
  const { formatMoney } = useCurrency();
  const { platforms } = useUserPlatforms();

  // Mode: "view" | "edit" | "payment"
  const [mode, setMode] = useState<"view" | "edit" | "payment">("view");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editLender, setEditLender] = useState("");
  const [editType, setEditType] = useState("bank_loan");
  const [editOriginalPrincipal, setEditOriginalPrincipal] = useState("");
  const [editCurrentBalance, setEditCurrentBalance] = useState("");
  const [editInterestRate, setEditInterestRate] = useState("");
  const [editMonthlyPayment, setEditMonthlyPayment] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editMaturityDate, setEditMaturityDate] = useState("");
  const [editCurrency, setEditCurrency] = useState("TOMAN");
  const [editError, setEditError] = useState<string | null>(null);

  // New Payment Form state
  const [payAmount, setPayAmount] = useState("");
  const [payPrincipal, setPayPrincipal] = useState("");
  const [payInterest, setPayInterest] = useState("0");
  const [payExtraPrincipal, setPayExtraPrincipal] = useState("0");
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch Payment History
  const { data: payments = [], refetch: refetchPayments } = useQuery<LiabilityPayment[]>({
    queryKey: ["liability-payments", liability?.id],
    queryFn: () => (liability ? api.getLiabilityPayments(liability.id) : Promise.resolve([])),
    enabled: isOpen && !!liability,
  });

  // Sync state when liability opens or changes
  useEffect(() => {
    if (liability) {
      setEditName(liability.name || "");
      setEditLender(liability.lender || "");
      setEditType(liability.liability_type || "bank_loan");
      setEditOriginalPrincipal(liability.original_principal || "");
      setEditCurrentBalance(liability.current_balance || "");
      setEditInterestRate(liability.interest_rate_percent || "0");
      setEditMonthlyPayment(liability.monthly_payment || "0");
      setEditStartDate(liability.start_date ? liability.start_date.split("T")[0] : "");
      setEditMaturityDate(liability.maturity_date ? liability.maturity_date.split("T")[0] : "");
      setEditCurrency(liability.currency || "TOMAN");
      setEditError(null);
      setMode("view");

      // Default payment amount to monthly payment
      setPayAmount(liability.monthly_payment || "");
      setPayPrincipal(liability.monthly_payment || "");
      setPayInterest("0");
      setPayExtraPrincipal("0");
    }
  }, [liability, isOpen]);

  // Calculations for installments
  const installmentMetrics = useMemo(() => {
    if (!liability) {
      return {
        totalInstallments: 0,
        paidInstallments: 0,
        remainingInstallments: 0,
        isFullyPaid: false,
        repaidPercent: 0,
        repaidAmount: 0,
      };
    }

    const origPrincipal = parseFloat(liability.original_principal) || 0;
    const currBalance = parseFloat(liability.current_balance) || 0;
    const monthlyPay = parseFloat(liability.monthly_payment) || 0;
    const repaidAmount = Math.max(0, origPrincipal - currBalance);
    const repaidPercent =
      origPrincipal > 0 ? Math.min(100, (repaidAmount / origPrincipal) * 100) : 0;
    const isFullyPaid = currBalance <= 0;

    // 1. If start_date & maturity_date are present, compute total months
    let totalMonths = 0;
    if (liability.start_date && liability.maturity_date) {
      const s = new Date(liability.start_date);
      const m = new Date(liability.maturity_date);
      const diffMs = m.getTime() - s.getTime();
      if (diffMs > 0) {
        totalMonths = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
      }
    }

    // 2. Fallback to principal / monthly payment if totalMonths not resolved
    if (totalMonths <= 0 && monthlyPay > 0 && origPrincipal > 0) {
      totalMonths = Math.max(1, Math.round(origPrincipal / monthlyPay));
    }

    // 3. Paid installments
    let paidCount = 0;
    if (payments && payments.length > 0) {
      paidCount = payments.length;
    } else if (totalMonths > 0) {
      paidCount = Math.min(
        totalMonths,
        Math.round((repaidAmount / (origPrincipal || 1)) * totalMonths)
      );
    }

    // 4. Remaining installments
    let remainingCount = 0;
    if (isFullyPaid) {
      remainingCount = 0;
    } else if (totalMonths > 0) {
      remainingCount = Math.max(0, totalMonths - paidCount);
    } else if (monthlyPay > 0 && currBalance > 0) {
      remainingCount = Math.ceil(currBalance / monthlyPay);
    }

    return {
      totalInstallments: totalMonths > 0 ? totalMonths : paidCount + remainingCount,
      paidInstallments: paidCount,
      remainingInstallments: remainingCount,
      isFullyPaid,
      repaidPercent,
      repaidAmount,
    };
  }, [liability, payments]);

  // Update Liability Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!liability) return;
      setEditError(null);
      if (!editName.trim()) throw new Error("لطفاً عنوان یا نام تعهد را وارد کنید.");

      const origP = parseFloat(editOriginalPrincipal);
      if (isNaN(origP) || origP <= 0) {
        throw new Error("لطفاً مبلغ معتبر برای اصل بدهی وارد کنید.");
      }

      const currB = parseFloat(editCurrentBalance);
      if (isNaN(currB) || currB < 0) {
        throw new Error("لطفاً مبلغ معتبر برای مانده بدهی وارد کنید.");
      }

      const payload: Record<string, unknown> = {
        name: editName.trim(),
        liability_type: editType,
        lender: editLender.trim() || null,
        original_principal: editOriginalPrincipal,
        current_balance: editCurrentBalance,
        interest_rate_percent: editInterestRate || "0",
        monthly_payment: editMonthlyPayment || "0",
        start_date: editStartDate || null,
        maturity_date: editMaturityDate || null,
        currency: editCurrency,
      };

      return await api.updateLiability(liability.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      setMode("view");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در به‌روزرسانی اطلاعات";
      setEditError(msg);
    },
  });

  // Record Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!liability) return;
      setPaymentError(null);
      const principal = parseFloat(payPrincipal);
      const interest = parseFloat(payInterest);
      const extra = parseFloat(payExtraPrincipal);

      if (isNaN(principal) || principal < 0) {
        throw new Error("لطفاً مبلغ معتبر برای اصل قسط وارد کنید.");
      }

      return await api.recordLoanPayment({
        liability_id: liability.id,
        payment_date: payDate,
        principal_amount: payPrincipal,
        interest_amount: payInterest || "0",
        extra_principal: payExtraPrincipal || "0",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      refetchPayments();
      setMode("view");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت پرداخت قسط";
      setPaymentError(msg);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!liability) return;
      await api.deleteLiability(liability.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liabilities"] });
      onClose();
    },
  });

  if (!isOpen || !liability) return null;

  const brand = getLenderBrand(liability.lender || "", liability.liability_type);
  const isFriendLent = liability.liability_type === "friend_lent";
  const isFriendBorrowed = liability.liability_type === "friend_borrowed";
  const typeLabel =
    liabilityLabels[liability.liability_type?.toLowerCase()] || liability.liability_type;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="obsidian-card-elevated w-full max-w-2xl bg-[#12151e] border border-white/10 shadow-2xl p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <LenderLogo
              lender={liability.lender}
              liabilityType={liability.liability_type}
              size="lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  {liability.name}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                    isFriendLent
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : isFriendBorrowed
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-white/5 text-slate-300 border-white/10"
                  }`}
                >
                  {isFriendLent && <ArrowUpRight className="h-3 w-3" />}
                  {isFriendBorrowed && <ArrowDownLeft className="h-3 w-3" />}
                  {typeLabel}
                </span>

                {installmentMetrics.isFullyPaid && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    تسویه کامل
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>طرف حساب:</span>
                <span className="font-semibold text-slate-200">
                  {liability.lender || brand.name}
                </span>
                {brand.badgeLabel && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {brand.badgeLabel}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {mode === "view" ? (
              <button
                onClick={() => setMode("edit")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="ویرایش و تکمیل اطلاعات"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ویرایش / تکمیل داده‌ها</span>
              </button>
            ) : (
              <button
                onClick={() => setMode("view")}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                مشاهده جزییات
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* MODE: VIEW DETAILS */}
        {mode === "view" && (
          <div className="space-y-6 text-xs">
            {/* Installment Counter and Progress Showcase */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  وضعیت و آمار اقساط
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {installmentMetrics.repaidPercent.toFixed(1)}% پرداخت شده
                </span>
              </div>

              {/* 3 Metrics in a row: Paid, Remaining, Total */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-[#0d1015] border border-white/5 shadow-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">اقساط پرداخت‌شده</span>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                    {installmentMetrics.paidInstallments}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-medium">
                    قسط تا الان
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1015] border border-white/5 shadow-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">اقساط باقی‌مانده</span>
                  <div className="text-lg sm:text-xl font-black text-rose-400 font-mono">
                    {installmentMetrics.remainingInstallments}
                  </div>
                  <span className="text-[10px] text-rose-400/80 font-medium">
                    قسط مانده
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1015] border border-white/5 shadow-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">کل تعداد اقساط</span>
                  <div className="text-lg sm:text-xl font-black text-slate-200 font-mono">
                    {installmentMetrics.totalInstallments}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">قسط کل</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-[#1B1D21] border border-[#282A2F] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFriendLent
                        ? "bg-[#76A98C]"
                        : "bg-[#F0AE55]"
                    }`}
                    style={{ width: `${Math.min(100, installmentMetrics.repaidPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>پرداخت‌شده: {formatMoney(installmentMetrics.repaidAmount)}</span>
                  <span>
                    مانده:{" "}
                    <b className="text-slate-100 font-bold">
                      {formatMoney(liability.current_balance)}
                    </b>
                  </span>
                </div>
              </div>
            </div>

            {/* Entity Financial Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">اصل مبلغ تعهد (وام)</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {formatMoney(liability.original_principal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">مبلغ قسط هر ماه</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {formatMoney(liability.monthly_payment)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">نرخ سود سالانه</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {parseFloat(liability.interest_rate_percent || "0") === 0
                    ? "بدون سود (۰٪)"
                    : `${parseFloat(liability.interest_rate_percent).toFixed(1)}%`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">تاریخ شروع / دریافت</span>
                <span className="text-xs font-semibold text-slate-200">
                  {liability.start_date ? formatDate(liability.start_date) : "ثبت‌نشده"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">تاریخ سررسید نهایی</span>
                <span className="text-xs font-semibold text-slate-200">
                  {liability.maturity_date ? formatDate(liability.maturity_date) : "مشخص‌نشده"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-slate-400 text-[10px] block mb-1">واحد پولی</span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {liability.currency || "TOMAN"}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMode("payment")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 stroke-[2.5]" />
                <span>ثبت پرداخت قسط جدید</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`آیا از حذف کامل «${liability.name}» مطمئن هستید؟`)) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>حذف این تعهد</span>
              </button>
            </div>

            {/* Payments History List */}
            <div className="space-y-2 pt-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <History className="h-4 w-4 text-slate-400" />
                تاریخچه اقساط ثبت‌شده ({payments.length})
              </h3>

              {payments.length > 0 ? (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(p.payment_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span>اصل: {formatMoney(p.principal_portion)}</span>
                        {parseFloat(p.interest_portion) > 0 && (
                          <span className="text-slate-400">
                            سود: {formatMoney(p.interest_portion)}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          کل: {formatMoney(p.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-center">
                  هنوز پرداختی به‌صورت دستی ثبت نشده است. می‌توانید با دکمه «ثبت پرداخت قسط جدید»
                  اقساط پرداخت‌شده را وارد نمایید.
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODE: EDIT / MISSING DATA INSERTION */}
        {mode === "edit" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 leading-relaxed">
              <span className="font-bold block mb-0.5 text-amber-400">ویرایش و تکمیل اطلاعات تعهد مالی</span>
              شما می‌توانید مقادیر ناقص (مانند نام بانک، تاریخ سررسید، مبلغ اقساط ماهانه یا نرخ سود)
              را در این فرم تکمیل و ذخیره فرمایید.
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  عنوان یا نام تعهد *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  نام بانک، پلتفرم یا طرف حساب
                </label>
                <input
                  type="text"
                  value={editLender}
                  onChange={(e) => setEditLender(e.target.value)}
                  placeholder="مثال: بانک مسکن، اسنپ‌پی، دوست..."
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  نوع تعهد
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                >
                  {liabilityTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  واحد پولی
                </label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                >
                  <option value="TOMAN">تومان (TOMAN)</option>
                  <option value="USD">دلار آمریکا (USD)</option>
                  <option value="EUR">یورو (EUR)</option>
                  <option value="IRT">تومان (IRT)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  اصل مبلغ کل اولیه *
                </label>
                <input
                  type="number"
                  value={editOriginalPrincipal}
                  onChange={(e) => setEditOriginalPrincipal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  مانده بدهی فعلی *
                </label>
                <input
                  type="number"
                  value={editCurrentBalance}
                  onChange={(e) => setEditCurrentBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  مبلغ هر قسط ماهانه
                </label>
                <input
                  type="number"
                  value={editMonthlyPayment}
                  onChange={(e) => setEditMonthlyPayment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  نرخ سود سالانه (درصد)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editInterestRate}
                  onChange={(e) => setEditInterestRate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  تاریخ شروع / دریافت
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  تاریخ سررسید نهایی
                </label>
                <input
                  type="date"
                  value={editMaturityDate}
                  onChange={(e) => setEditMaturityDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 font-semibold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 stroke-[2.5]" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MODE: RECORD PAYMENT */}
        {mode === "payment" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              paymentMutation.mutate();
            }}
            className="space-y-4 text-xs"
          >
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 leading-relaxed">
              <span className="font-bold block mb-0.5 text-emerald-400">ثبت واریز یا بازپرداخت قسط جدید</span>
              مبلغ پرداختی شما از مانده اصل این تعهد مالی کسر گردیده و آمار اقساط به‌روزرسانی
              می‌شود.
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                {paymentError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  تاریخ پرداخت قسط *
                </label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  سهم اصل قسط (کاهنده بدهی) *
                </label>
                <input
                  type="number"
                  value={payPrincipal}
                  onChange={(e) => setPayPrincipal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  سهم سود یا کارمزد بانکی
                </label>
                <input
                  type="number"
                  value={payInterest}
                  onChange={(e) => setPayInterest(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  پرداخت اضافه مازاد بر قسط (پیش‌پرداخت اصل)
                </label>
                <input
                  type="number"
                  value={payExtraPrincipal}
                  onChange={(e) => setPayExtraPrincipal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 font-semibold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={paymentMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {paymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    <span>ثبت پرداخت قسط</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
