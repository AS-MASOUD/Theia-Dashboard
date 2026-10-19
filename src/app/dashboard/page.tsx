"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  Building2,
  ShieldAlert,
  PiggyBank,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Scale,
  Flame,
  SlidersHorizontal,
  Zap,
  Coins,
  CheckCircle2,
  Target,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { MetricCard } from "@/components/financial/metric-card";
import { AttentionBanner } from "@/components/financial/attention-banner";
import { AllocationDonut } from "@/components/financial/financial-charts";
import { WealthTrajectoryChart } from "@/components/financial/wealth-trajectory-chart";
import { useCurrency } from "@/components/currency-provider";
import { useAuth } from "@/components/auth-provider";
import { FinancialOnboardingModal } from "@/components/onboarding/financial-onboarding-modal";
import { RiskAssessmentModal } from "@/components/onboarding/risk-assessment-modal";

export default function OverviewDashboardPage() {
  const { formatMoney } = useCurrency();
  const { user, refreshProfile } = useAuth();

  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const {
    data: overview,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => api.getOverview(),
  });

  const { data: snapshots } = useQuery({
    queryKey: ["analytics-snapshots"],
    queryFn: () => api.getSnapshots(90),
  });

  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.getGoals(),
  });

  // Check if user was redirected from register or needs onboarding
  useEffect(() => {
    if (typeof window === "undefined" || !user || hasCheckedOnboarding) return;

    const params = new URLSearchParams(window.location.search);
    const isOnboardingFlag = params.get("onboarding") === "1";

    if (isOnboardingFlag || !user.has_completed_financial_onboarding) {
      setShowFinancialModal(true);
      setHasCheckedOnboarding(true);
    }
  }, [user, hasCheckedOnboarding]);

  const handleFinancialSuccess = async () => {
    setShowFinancialModal(false);
    await refreshProfile();
    await refetchOverview();
    // Proceed to Step 2: Risk Assessment Modal
    setShowRiskModal(true);
  };

  const handleRiskSuccess = async () => {
    setShowRiskModal(false);
    await refreshProfile();
    await refetchOverview();
  };

  // Computed values from user history snapshots for metric cards
  const {
    netWorthValue,
    netWorthChange,
    liabilitiesValue,
    monthlyDebtService,
  } = React.useMemo(() => {
    const fallbackNetWorth = overview?.net_worth
      ? parseFloat(overview.net_worth)
      : 0;
    const fallbackLiabilities = overview?.total_liabilities
      ? parseFloat(overview.total_liabilities)
      : 0;
    const fallbackDebtService = overview?.monthly_debt_service
      ? parseFloat(overview.monthly_debt_service)
      : 0;

    const obligations = overview?.upcoming_obligations || [];
    const loanPaymentsSum = obligations.reduce(
      (acc, curr) => acc + (Number(curr.monthly_payment) || 0),
      0,
    );

    // If user has not completed onboarding, or no snapshots exist, or snapshots are unreachable:
    if (!snapshots || !Array.isArray(snapshots) || snapshots.length === 0) {
      const safeLiab = fallbackLiabilities > 0 ? fallbackLiabilities : 0;
      const safeDebtService =
        safeLiab > 0
          ? loanPaymentsSum > 0
            ? loanPaymentsSum
            : fallbackDebtService
          : 0;

      return {
        netWorthValue: fallbackNetWorth,
        netWorthChange: 0,
        liabilitiesValue: safeLiab,
        monthlyDebtService: safeDebtService,
      };
    }

    // Sort chronologically ascending
    const sorted = [...snapshots].sort(
      (a, b) =>
        new Date(a.snapshot_date).getTime() -
        new Date(b.snapshot_date).getTime(),
    );

    const latestSnap = sorted[sorted.length - 1];
    const latestNetWorth =
      latestSnap && latestSnap.net_worth !== undefined
        ? parseFloat(latestSnap.net_worth)
        : fallbackNetWorth;

    const latestLiabRaw =
      latestSnap && latestSnap.total_liabilities !== undefined
        ? parseFloat(latestSnap.total_liabilities)
        : fallbackLiabilities;

    // Liabilities: make it 0 if user not entered debt data or any loan or other things, and calculate from data snapshot if available
    const safeLiab =
      !isNaN(latestLiabRaw) && latestLiabRaw > 0 ? latestLiabRaw : 0;
    const safeDebtService =
      safeLiab > 0
        ? loanPaymentsSum > 0
          ? loanPaymentsSum
          : fallbackDebtService
        : 0;

    let nwChange = 0;

    if (sorted.length >= 2) {
      const latestTime = new Date(latestSnap.snapshot_date).getTime();
      const thirtyDaysAgo = latestTime - 30 * 24 * 60 * 60 * 1000;

      // Find comparison snapshot from previous snapshots (~30 days ago)
      const previousSnaps = sorted.slice(0, -1);
      let refSnap = previousSnaps[0];
      let minDiff = Infinity;

      for (const s of previousSnaps) {
        const diff = Math.abs(
          new Date(s.snapshot_date).getTime() - thirtyDaysAgo,
        );
        if (diff < minDiff) {
          minDiff = diff;
          refSnap = s;
        }
      }

      if (refSnap && refSnap.snapshot_date !== latestSnap.snapshot_date) {
        const pastNw = parseFloat(refSnap.net_worth);
        if (!isNaN(pastNw) && pastNw !== 0 && !isNaN(latestNetWorth)) {
          const rawNw = ((latestNetWorth - pastNw) / Math.abs(pastNw)) * 100;
          nwChange =
            isFinite(rawNw) && !isNaN(rawNw) ? Number(rawNw.toFixed(1)) : 0;
        }
      }
    }

    return {
      netWorthValue: latestNetWorth,
      netWorthChange: nwChange,
      liabilitiesValue: safeLiab,
      monthlyDebtService: safeDebtService,
    };
  }, [snapshots, overview]);

  return (
    <>
      {isOverviewLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* Metric skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="fin-card h-28 bg-slate-200 dark:bg-slate-800/60 rounded-xl"
              />
            ))}
          </div>
          {/* Chart skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 fin-card h-[360px] bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
            <div className="fin-card h-[360px] bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      ) : overviewError ? (
        <div className="fin-card p-8 text-center max-w-lg mx-auto my-12 space-y-4">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            خطا در دریافت اطلاعات مالی
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {(overviewError as Error).message ||
              "ارتباط با پایگاه‌داده یا سرویس بک‌اند برقرار نشد."}
          </p>
          <button
            onClick={() => refetchOverview()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      ) : overview ? (
        <div className="space-y-6">
          {/* Reference Screen 1 Inspiration: Luxury Minimalist Greeting & Quick Scene Pills */}
          <div className="bg-[#141518] p-6 rounded-[22px] flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#282A2F]">
            {/* User Greeting & Status Chips */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] font-semibold text-lg shrink-0">
                {user?.full_name?.charAt(0) || "U"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#E8E8E8] tracking-tight">
                    عصر بخیر، {user?.full_name || "کاربر گرامی"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[rgba(240,174,85,0.09)] border border-[rgba(240,174,85,0.22)] text-[#F0AE55] text-[11px] font-medium">
                    داشبورد مدیریت تئا
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#9A9DA5]">
                  <span className="flex items-center gap-1.5 font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C]" />
                    <span>پایگاه‌داده متصل است</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55]" />
                    <span>
                      {overview.upcoming_obligations?.length || 0} تعهد فعال
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-[#9A9DA5] font-number">
                    ارزش خالص:{" "}
                    <strong className="text-[#E8E8E8] font-semibold">
                      {formatMoney(netWorthValue)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Scene Pills (Inspired by Movie / Goodnight / Away in Reference Screen 1) */}
            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <span className="px-3.5 py-1.5 rounded-[12px] text-xs font-medium bg-[rgba(240,174,85,0.12)] border border-[rgba(240,174,85,0.30)] text-[#F0AE55] flex items-center gap-1.5 cursor-default">
                <Sparkles className="w-3.5 h-3.5" />
                <span>نمای پورتفوی</span>
              </span>

              <Link
                href="/portfolio"
                className="px-3.5 py-1.5 rounded-[12px] text-xs font-medium bg-[#1B1D21] hover:bg-[#222327] text-[#9A9DA5] hover:text-[#E8E8E8] border border-[#282A2F] hover:border-[#32343A] transition-colors flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#696D77]" />
                <span>تخصیص سبد</span>
              </Link>

              <Link
                href="/liabilities"
                className="px-3.5 py-1.5 rounded-[12px] text-xs font-medium bg-[#1B1D21] hover:bg-[#222327] text-[#9A9DA5] hover:text-[#E8E8E8] border border-[#282A2F] hover:border-[#32343A] transition-colors flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-[#696D77]" />
                <span>وام و اقساط</span>
              </Link>

              <Link
                href="/cashflow"
                className="px-3.5 py-1.5 rounded-[12px] text-xs font-medium bg-[#1B1D21] hover:bg-[#222327] text-[#9A9DA5] hover:text-[#E8E8E8] border border-[#282A2F] hover:border-[#32343A] transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[#696D77]" />
                <span>جریان نقدینگی</span>
              </Link>

              <Link
                href="/ai"
                className="px-3.5 py-1.5 rounded-[12px] text-xs font-medium bg-[#1B1D21] hover:bg-[#222327] text-[#9A9DA5] hover:text-[#E8E8E8] border border-[#282A2F] hover:border-[#32343A] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#696D77]" />
                <span>دستیار هوشمند</span>
              </Link>
            </div>
          </div>

          {/* Onboarding Guidance Banners */}
          {user &&
            user.role !== "sysmanager" &&
            !user.has_completed_financial_onboarding && (
              <div className="bg-[#141518] p-5 rounded-[22px] border border-[#282A2F] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#E8E8E8]">
                      حساب شما آماده است! اطلاعات مالی و شغلی خود را ثبت کنید
                    </h3>
                    <p className="text-xs text-[#9A9DA5] mt-0.5 font-normal">
                      با تکمیل درآمد شغلی و آزمون روانشناسی ریسک، کارت‌ها و
                      نمودارهای تحلیل ثروت شما بر اساس دارایی‌هایتان فعال
                      می‌شوند.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFinancialModal(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>تکمیل اطلاعات و سنجش ریسک</span>
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
                </button>
              </div>
            )}

          {user &&
            user.role !== "sysmanager" &&
            user.has_completed_financial_onboarding &&
            !user.has_completed_risk_onboarding && (
              <div className="bg-[#141518] p-5 rounded-[22px] border border-[#282A2F] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] text-[#B9823D] flex items-center justify-center shrink-0">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#E8E8E8]">
                      آزمون روانشناسی ریسک‌پذیری تکمیل نشده است
                    </h3>
                    <p className="text-xs text-[#9A9DA5] mt-0.5 font-normal">
                      با پاسخ به ۵ پرسش، سطح ریسک و ترکیب سبد دارایی‌های
                      پیشنهادی شما تعیین می‌شود.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRiskModal(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-[12px] bg-[#1B1D21] hover:bg-[#222327] border border-[#282A2F] hover:border-[#32343A] text-[#E8E8E8] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>شرکت در آزمون سنجش ریسک</span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

          {/* 2. Top Metric Cards (Direct Obsidian Pod Translation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="ارزش خالص کل"
              value={netWorthValue}
              change={netWorthChange}
              changePeriod="نسبت به ماه گذشته"
              icon={Wallet}
              variant="warning"
            />
            <MetricCard
              title="مجموع دارایی‌ها"
              value={overview.total_assets}
              subtitle={`سرمایه‌گذاری شده: ${formatMoney(overview.invested_capital)}`}
              icon={Building2}
              variant="positive"
            />
            <MetricCard
              title="مجموع بدهی‌ها و وام‌ها"
              value={liabilitiesValue}
              subtitle={`اقساط ماهانه: ${formatMoney(monthlyDebtService)}`}
              icon={ShieldAlert}
              variant="negative"
            />
            <MetricCard
              title="نقدینگی در دسترس"
              value={overview.liquid_cash}
              subtitle="حساب‌های جاری، پس‌انداز و نقد"
              icon={PiggyBank}
              variant="default"
            />
          </div>

          {/* 3. Primary Charts: Wealth Trajectory & Asset Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WealthTrajectoryChart />
            </div>
            <div>
              <AllocationDonut data={overview.asset_allocation || []} />
            </div>
          </div>

          {/* 4. Cash Flow Waterfall & Upcoming Obligations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Flow Summary */}
            <div className="lg:col-span-2 bg-[#141518] p-6 rounded-[22px] flex flex-col justify-between border border-[#282A2F]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F0AE55]" />
                    <span>معماری جریان نقدینگی ماهانه</span>
                  </h3>
                  <p className="text-xs text-[#9A9DA5] mt-0.5 font-normal">
                    مازاد خالص نقدینگی پس از کسر هزینه‌های جاری زندگی و اقساط
                    وام‌ها
                  </p>
                </div>
                <Link
                  href="/cashflow"
                  className="text-xs font-medium text-[#F0AE55] hover:text-[#F5BA6E] flex items-center gap-1 transition-colors"
                >
                  <span>مشاهده تفکیک کامل</span>
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                <div className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76A98C]" />
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      کل درآمدها
                    </span>
                  </div>
                  <div
                    className="text-base font-semibold text-[#E8E8E8] mt-1.5 font-number"
                    dir="ltr"
                  >
                    {formatMoney(overview.monthly_income)}
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77A82]" />
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      کل مخارج
                    </span>
                  </div>
                  <div
                    className="text-base font-semibold text-[#E8E8E8] mt-1.5 font-number"
                    dir="ltr"
                  >
                    {formatMoney(overview.monthly_expenses)}
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55]" />
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      اقساط وام‌ها
                    </span>
                  </div>
                  <div
                    className="text-base font-semibold text-[#E8E8E8] mt-1.5 font-number"
                    dir="ltr"
                  >
                    {formatMoney(overview.monthly_debt_service)}
                  </div>
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#88A9BC]" />
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      پس‌انداز مازاد
                    </span>
                  </div>
                  <div
                    className="text-base font-semibold text-[#E8E8E8] mt-1.5 font-number"
                    dir="ltr"
                  >
                    {formatMoney(overview.monthly_free_cashflow)}
                  </div>
                </div>
              </div>

              {/* Quick Cash Flow Progress Visualizer */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-[#9A9DA5] font-normal">
                  <span>نرخ بهره‌برداری از درآمد</span>
                  <span
                    className="font-number text-[#E8E8E8] font-semibold"
                    dir="ltr"
                  >
                    {parseFloat(overview.monthly_income) > 0
                      ? `${(
                          ((parseFloat(overview.monthly_expenses) +
                            parseFloat(overview.monthly_debt_service)) /
                            parseFloat(overview.monthly_income)) *
                          100
                        ).toFixed(1)}% مصرف‌شده`
                      : "0%"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#1B1D21] rounded-full overflow-hidden flex border border-[#282A2F] p-0.5">
                  <div
                    className="bg-[#C77A82] h-full rounded-full transition-all"
                    style={{
                      width: `${
                        parseFloat(overview.monthly_income) > 0
                          ? Math.min(
                              100,
                              (parseFloat(overview.monthly_expenses) /
                                parseFloat(overview.monthly_income)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                    title="مخارج"
                  />
                  <div
                    className="bg-[#F0AE55] h-full rounded-full transition-all mx-0.5"
                    style={{
                      width: `${
                        parseFloat(overview.monthly_income) > 0
                          ? Math.min(
                              100,
                              (parseFloat(overview.monthly_debt_service) /
                                parseFloat(overview.monthly_income)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                    title="اقساط بدهی"
                  />
                  <div
                    className="bg-[#76A98C] h-full rounded-full transition-all flex-1"
                    title="پس‌انداز مازاد"
                  />
                </div>
                <div className="flex items-center gap-5 text-[10px] text-[#9A9DA5] pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C77A82]" />
                    <span>هزینه‌های زندگی</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F0AE55]" />
                    <span>اقساط بدهی</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
                    <span>مازاد آزاد قابل سرمایه‌گذاری</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Obligations */}
            <div className="bg-[#141518] p-6 rounded-[22px] flex flex-col justify-between border border-[#282A2F]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F0AE55]" />
                    <span>تعهدات و سررسیدهای پیش‌رو</span>
                  </h3>
                  <p className="text-xs text-[#9A9DA5] mt-0.5 font-normal">
                    اقساط و پرداخت‌های آتی تسهیلات
                  </p>
                </div>
                <Calendar className="h-4 w-4 text-[#696D77]" />
              </div>

              <div className="space-y-2.5 my-auto">
                {overview.upcoming_obligations &&
                overview.upcoming_obligations.length > 0 ? (
                  overview.upcoming_obligations.map((ob) => (
                    <div
                      key={ob.id}
                      className="p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] hover:border-[#32343A] transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-[#E8E8E8]">
                          {ob.name}
                        </span>
                        <span className="text-[11px] text-[#9A9DA5] flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-[#B9823D]" />
                          سررسید روز {ob.due_day} هر ماه
                        </span>
                      </div>
                      <div className="text-left font-number" dir="ltr">
                        <span className="font-semibold text-[#E8E8E8]">
                          {formatMoney(ob.monthly_payment)}
                        </span>
                        <span className="block text-[10px] text-[#696D77]">
                          مانده: {formatMoney(ob.remaining_balance)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#9A9DA5]">
                    تعهد بدهی یا اقساط فعالی ثبت نشده است.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#282A2F] mt-3">
                <Link
                  href="/liabilities"
                  className="text-xs font-medium text-[#F0AE55] hover:text-[#F5BA6E] flex items-center justify-between transition-colors"
                >
                  <span>مدیریت تسهیلات و استهلاک وام</span>
                  <ArrowLeft className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Priority Financial Goals */}
          <div className="bg-[#141518] p-6 rounded-[22px] border border-[#282A2F]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#F0AE55]" />
                  <span>اهداف مالی و پس‌انداز فعال</span>
                </h3>
                <p className="text-xs text-[#9A9DA5] mt-0.5 font-normal">
                  رصد پیشرفت و زمان‌بندی دستیابی به اهداف
                </p>
              </div>
              <Link
                href="/goals"
                className="text-xs font-medium text-[#F0AE55] hover:text-[#F5BA6E] flex items-center gap-1 transition-colors"
              >
                <span>مشاهده همه اهداف</span>
                <ArrowLeft className="h-3 w-3" />
              </Link>
            </div>

            {goals && goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.map((goal) => {
                  const pct = parseFloat(goal.progress_percent) || 0;
                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-[16px] bg-[#1B1D21] border border-[#282A2F] hover:border-[#32343A] transition-colors flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#E8E8E8]">
                            {goal.name}
                          </span>
                          <span
                            className="text-[11px] font-semibold text-[#F0AE55] font-number"
                            dir="ltr"
                          >
                            {pct.toFixed(0)}%
                          </span>
                        </div>

                        <div
                          className="mt-2 text-sm font-semibold text-[#E8E8E8] font-number"
                          dir="ltr"
                        >
                          {formatMoney(goal.current_amount)}{" "}
                          <span className="text-xs font-normal text-[#9A9DA5]">
                            / {formatMoney(goal.target_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full h-2 bg-[#141518] rounded-full overflow-hidden border border-[#282A2F]">
                          <div
                            className="bg-[#F0AE55] h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#9A9DA5] font-number">
                          <span>موعد هدف: {goal.target_date}</span>
                          <span dir="ltr">
                            +{formatMoney(goal.monthly_contribution)}/ماه
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#9A9DA5]">
                هنوز هدف مالی فعالی ثبت نشده است. از بخش اهداف مالی می‌توانید
                نخستین هدف خود را تعریف کنید.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Onboarding Modals */}
      <FinancialOnboardingModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        onSuccess={handleFinancialSuccess}
        initialData={
          user
            ? {
                job: user.job || "",
                monthly_income: user.monthly_income
                  ? Number(user.monthly_income)
                  : 0,
                liquid_assets: user.liquid_assets
                  ? Number(user.liquid_assets)
                  : 0,
                investment_assets: user.investment_assets
                  ? Number(user.investment_assets)
                  : 0,
                total_liabilities: user.total_liabilities
                  ? Number(user.total_liabilities)
                  : 0,
                financial_goals: user.financial_goals || [],
              }
            : undefined
        }
      />

      <RiskAssessmentModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onSuccess={handleRiskSuccess}
        initialAnswers={user?.risk_answers || undefined}
      />
    </>
  );
}
