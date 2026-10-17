"use client";

import React, { useState, useEffect } from "react";
import { X, Scale, Save, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { api } from "@/lib/api";

interface CustomAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CustomAllocationModal({
  isOpen,
  onClose,
  onSuccess,
}: CustomAllocationModalProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [equities, setEquities] = useState<string>("40");
  const [gold, setGold] = useState<string>("20");
  const [fixedIncome, setFixedIncome] = useState<string>("20");
  const [crypto, setCrypto] = useState<string>("10");
  const [cash, setCash] = useState<string>("10");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.portfolio_suggestion) {
      const s = user.portfolio_suggestion;
      setEquities(String(s.equities ?? 40));
      setGold(String(s.gold ?? s.gold_commodity ?? 20));
      setFixedIncome(String(s.fixed_income ?? 20));
      setCrypto(String(s.crypto ?? 10));
      setCash(String(s.cash ?? 10));
    }
  }, [user]);

  if (!isOpen) return null;

  const eqNum = parseFloat(equities) || 0;
  const goldNum = parseFloat(gold) || 0;
  const fiNum = parseFloat(fixedIncome) || 0;
  const cryptoNum = parseFloat(crypto) || 0;
  const cashNum = parseFloat(cash) || 0;

  const totalSum = eqNum + goldNum + fiNum + cryptoNum + cashNum;
  const isValidSum = Math.abs(totalSum - 100) < 0.1;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (eqNum < 0 || goldNum < 0 || fiNum < 0 || cryptoNum < 0 || cashNum < 0) {
      setErrorMsg("درصدهای تخصیص نمی‌توانند مقادیر منفی داشته باشند.");
      return;
    }

    if (!isValidSum) {
      setErrorMsg(`مجموع درصدهای تخصیص باید دقیقاً ۱۰۰٪ باشد. (مجموع فعلی: ${totalSum.toFixed(1)}٪)`);
      return;
    }

    setIsSaving(true);
    try {
      const newAllocation = {
        equities: eqNum,
        gold: goldNum,
        fixed_income: fiNum,
        crypto: cryptoNum,
        cash: cashNum,
      };

      await api.updateProfile({
        portfolio_suggestion: newAllocation,
      });

      await refreshProfile();
      toast.success("درصدهای تخصیص هدف پورتفوی با موفقیت بروزرسانی شدند.", "تنظیم تخصیص");

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره‌سازی درصد تخصیص.";
      setErrorMsg(msg);
      toast.error(msg, "خطای ذخیره‌سازی");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreset = (preset: "conservative" | "moderate" | "aggressive") => {
    if (preset === "conservative") {
      setEquities("20");
      setGold("25");
      setFixedIncome("35");
      setCrypto("5");
      setCash("15");
    } else if (preset === "moderate") {
      setEquities("40");
      setGold("20");
      setFixedIncome("20");
      setCrypto("10");
      setCash("10");
    } else {
      setEquities("55");
      setGold("15");
      setFixedIncome("10");
      setCrypto("15");
      setCash("5");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#10131a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                تعیین درصد تخصیص هدف پورتفوی
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تنظیم سقف‌های مجاز سرمایه‌گذاری برای ردیابی هشدارهای عدم انطباق
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-between bg-[#0c0e14] border border-white/10 p-3 rounded-2xl">
          <span className="text-xs font-semibold text-slate-300">
            الگوهای آماده:
          </span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handlePreset("conservative")}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              محافظه‌کارانه
            </button>
            <button
              type="button"
              onClick={() => handlePreset("moderate")}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              متعادل
            </button>
            <button
              type="button"
              onClick={() => handlePreset("aggressive")}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              رشد ریسک‌پذیر
            </button>
          </div>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2.5">
            {/* Equities */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-[#0c0e14]">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  سهام و ETFها (Equities)
                </label>
                <span className="text-[11px] text-slate-400">بورس و صندوق‌های سهامی</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={equities}
                  onChange={(e) => setEquities(e.target.value)}
                  className="w-20 px-2 py-1 text-center rounded-lg border border-white/10 bg-[#07080b] text-sm font-bold font-mono text-slate-100 focus:ring-2 focus:ring-amber-500/40"
                />
                <span className="text-xs font-bold text-slate-500">٪</span>
              </div>
            </div>

            {/* Gold & Commodities */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-[#0c0e14]">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  طلا و کالاها (Gold & Commodities)
                </label>
                <span className="text-[11px] text-slate-400">صندوق طلا، گواهی سپرده و سکه</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={gold}
                  onChange={(e) => setGold(e.target.value)}
                  className="w-20 px-2 py-1 text-center rounded-lg border border-white/10 bg-[#07080b] text-sm font-bold font-mono text-slate-100 focus:ring-2 focus:ring-amber-500/40"
                />
                <span className="text-xs font-bold text-slate-500">٪</span>
              </div>
            </div>

            {/* Fixed Income */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-[#0c0e14]">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  اوراق درآمد ثابت (Fixed Income)
                </label>
                <span className="text-[11px] text-slate-400">صندوق‌های درآمد ثابت و مرابحه</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={fixedIncome}
                  onChange={(e) => setFixedIncome(e.target.value)}
                  className="w-20 px-2 py-1 text-center rounded-lg border border-white/10 bg-[#07080b] text-sm font-bold font-mono text-slate-100 focus:ring-2 focus:ring-amber-500/40"
                />
                <span className="text-xs font-bold text-slate-500">٪</span>
              </div>
            </div>

            {/* Crypto */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-[#0c0e14]">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  ارزهای دیجیتال (Crypto)
                </label>
                <span className="text-[11px] text-slate-400">بیت‌کوین، اتریوم و رمزارزها</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={crypto}
                  onChange={(e) => setCrypto(e.target.value)}
                  className="w-20 px-2 py-1 text-center rounded-lg border border-white/10 bg-[#07080b] text-sm font-bold font-mono text-slate-100 focus:ring-2 focus:ring-amber-500/40"
                />
                <span className="text-xs font-bold text-slate-500">٪</span>
              </div>
            </div>

            {/* Cash */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/10 bg-[#0c0e14]">
              <div>
                <label className="text-xs font-bold text-slate-200 block">
                  نقدینگی و ارز (Cash & Fiat)
                </label>
                <span className="text-[11px] text-slate-400">حساب‌های پس‌انداز و اسکناس</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  className="w-20 px-2 py-1 text-center rounded-lg border border-white/10 bg-[#07080b] text-sm font-bold font-mono text-slate-100 focus:ring-2 focus:ring-amber-500/40"
                />
                <span className="text-xs font-bold text-slate-500">٪</span>
              </div>
            </div>
          </div>

          {/* Sum Validation Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0c0e14] border border-white/10 text-xs">
            <span className="font-semibold text-slate-300">
              مجموع درصدهای تخصیص:
            </span>
            <span
              className={`font-bold font-mono text-sm flex items-center gap-1 ${
                isValidSum
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {isValidSum ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{totalSum.toFixed(1)}٪</span>
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 border border-white/10 transition-all cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSaving || !isValidSum}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>ذخیره تخصیص هدف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
