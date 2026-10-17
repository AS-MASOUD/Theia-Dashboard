"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  PieChart,
  Layers,
  LineChart,
  SlidersHorizontal,
  Bot,
  Coins,
  CheckCircle2,
  RefreshCw,
  Flame,
  Zap,
  Lock,
  ChevronLeft,
  Calendar,
  Clock,
  ArrowDownUp,
  Sliders,
  DollarSign,
  Activity,
  Award,
  Eye,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { FALLBACK_MARKET_RATES } from "@/data/market-data-fallback";
import { getAllInsights } from "@/data/insights-data";
import { MarketQuote, MarketRatesResponse } from "@/types/financial";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

// Mini Sparkline component
function Sparkline({ isPositive }: { isPositive: boolean }) {
  const points = isPositive
    ? "0,20 15,16 30,18 45,10 60,12 75,6 90,8 105,3 120,2"
    : "0,3 15,5 30,10 45,8 60,16 75,12 90,18 105,15 120,22";

  return (
    <svg className="w-18 h-5 overflow-visible" viewBox="0 0 120 24">
      <polyline
        fill="none"
        stroke={isPositive ? "#76A98C" : "#C77A82"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function PublicHomePage() {
  const { isAuthenticated } = useAuth();

  // Interactive Demo Tab State
  const [demoTab, setDemoTab] = useState<"portfolio" | "cashflow" | "health" | "trajectory">("portfolio");

  // Interactive Ambient Mode Slider State (Reference styling from Media 2)
  const [ambientRisk, setAmbientRisk] = useState<number>(65);

  // Live Market Rates Query
  const { data: marketData, isRefetching, refetch } = useQuery<MarketRatesResponse>({
    queryKey: ["public-home-market-rates"],
    queryFn: async () => {
      try {
        return await api.getMarketRates();
      } catch {
        return FALLBACK_MARKET_RATES;
      }
    },
    initialData: FALLBACK_MARKET_RATES,
    refetchInterval: 60000,
  });

  // Top spotlight market quotes
  const spotlightQuotes = useMemo(() => {
    if (!marketData) return [];
    const all = [
      ...(marketData.gold_and_coins || []),
      ...(marketData.currencies || []),
      ...(marketData.cryptocurrency || []),
      ...(marketData.commodities || []),
    ];

    const targetSymbols = ["IR_GOLD_18K", "EMAMI_COIN", "USD", "BTC", "EUR", "XAUUSD"];
    return targetSymbols
      .map((sym) => all.find((q) => q.symbol === sym))
      .filter((q): q is MarketQuote => !!q);
  }, [marketData]);

  // Featured insights
  const insights = useMemo(() => getAllInsights().slice(0, 3), []);

  return (
    <div className="space-y-24 md:space-y-36 pb-20 overflow-x-hidden">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Part 6)                                 */}
      {/* ======================================================== */}
      <section className="relative pt-12 md:pt-24 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Soft Ambient Radial Illumination behind hero */}
        <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.09)_0%,transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,rgba(118,169,140,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Right Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-right">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151619] border border-white/[0.08] shadow-[0_0_16px_rgba(240,174,85,0.12)]">
              <span className="w-2 h-2 rounded-full bg-[#F0AE55] animate-pulse" />
              <span className="text-xs font-semibold text-[#F0F0F1]">
                مرکز هوشمند فرماندهی ثروت و تصمیم‌گیری مالی
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#F0F0F1] tracking-tight leading-[1.25]">
              امروز دارایی‌هایت را بشناس،{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#F0AE55] via-[#F3BE76] to-[#E29D44]">
                فردای مالی‌ات را
              </span>{" "}
              هوشمندانه بساز
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-[#A0A3AD] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              دارایی‌ها، سرمایه‌گذاری‌ها، بدهی‌ها و جریان نقدینگی خود را در یک مکان مدیریت کنید؛ گذشته مالی‌تان را تحلیل کنید و با شبیه‌سازی و هوش مصنوعی، سناریوهای آینده را با اطمینان بشناسید.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-7 py-3.5 rounded-[14px] bg-gradient-to-r from-[#F0AE55] to-[#E29D44] hover:from-[#F3BE76] hover:to-[#F0AE55] text-[#0D0E10] text-sm font-black transition-all shadow-[0_0_24px_rgba(240,174,85,0.35)] hover:shadow-[0_0_32px_rgba(240,174,85,0.5)] flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{isAuthenticated ? "ورود به مرکز فرماندهی (داشبورد)" : "شروع رایگان"}</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[14px] bg-[#151619] hover:bg-[#1B1D22] text-[#F0F0F1] text-sm font-semibold border border-white/[0.08] hover:border-white/[0.18] transition-all flex items-center justify-center gap-2"
              >
                <span>آشنایی با امکانات</span>
              </Link>
            </div>

            {/* Free Value Statement */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#707581]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#76A98C]" />
                شروع ۱۰۰٪ رایگان
              </span>
              <span className="text-white/10">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#76A98C]" />
                بدون نیاز به کارت یا اطلاعات بانکی
              </span>
              <span className="text-white/10">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#76A98C]" />
                رمزنگاری و ایزولاسیون داده‌ها
              </span>
            </div>
          </div>

          {/* Left Column: Premium Layered Application Preview (Reference & Mobile styled) */}
          <div className="lg:col-span-6 relative">
            {/* Elevated preview container */}
            <div className="relative rounded-[26px] bg-[#141519] border border-white/[0.09] p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.65)] space-y-5 backdrop-blur-xl">
              {/* Header card preview */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[13px] bg-gradient-to-tr from-[#F0AE55] to-[#B37834] flex items-center justify-center text-[#0D0E10] font-bold shadow-[0_0_14px_rgba(240,174,85,0.25)]">
                    <Wallet className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#F0F0F1]">مرکز فرماندهی تئا</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#76A98C]/15 text-[#76A98C] font-semibold border border-[#76A98C]/30">
                        داده زنده
                      </span>
                    </div>
                    <span className="text-[10px] text-[#707581]">نسخه پیش‌نمایش تعاملی</span>
                  </div>
                </div>

                {/* Net worth readout */}
                <div className="text-left">
                  <span className="text-[10px] text-[#A0A3AD]">ارزش خالص کل (Net Worth)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-[#F0F0F1] font-mono">
                      ۸۴۵,۰۰۰,۰۰۰
                    </span>
                    <span className="text-[10px] text-[#F0AE55]">تومان</span>
                  </div>
                </div>
              </div>

              {/* Ambient Mode Card (Identical to User Mobile Screenshot Media 2) */}
              <div className="rounded-[20px] bg-[#1A1C21] border border-white/[0.07] p-5 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-[#F0AE55] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55]" />
                      مدل تئا • پورتفولیو بهینه
                    </span>
                    <h3 className="text-sm font-bold text-[#F0F0F1]">
                      حالت تعادلی (Ambient Mode)
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-[8px] bg-[#76A98C]/15 text-[#76A98C] text-[10px] font-bold border border-[#76A98C]/25">
                    +۱۲.۴٪ رشد ماهانه
                  </span>
                </div>

                {/* Vertical Tactile Sliders / Fills (Media 2 style) */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  {/* Left: Quick Toggle Switch */}
                  <div className="col-span-3 rounded-[16px] bg-[#121316] border border-white/[0.06] p-3 flex flex-col justify-between items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-[#F0AE55] flex items-center justify-center text-[#0D0E10] shadow-[0_0_12px_rgba(240,174,85,0.4)]">
                      <Zap className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-[#F0AE55]">روشن</span>
                      <p className="text-[9px] text-[#707581]">تعدیل خودکار</p>
                    </div>
                  </div>

                  {/* Middle: 30% Safe Reserve Card */}
                  <div className="col-span-4 rounded-[16px] bg-[#121316] border border-white/[0.06] p-3 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="text-lg font-black text-[#F0F0F1]">۳۰٪</span>
                      <p className="text-[10px] text-[#88A9BC] font-semibold mt-0.5">
                        ذخیره امن
                      </p>
                      <span className="text-[9px] text-[#707581]">نقدینگی و بانکی</span>
                    </div>
                    <div className="w-full bg-[#88A9BC]/15 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#88A9BC] h-full w-[30%]" />
                    </div>
                  </div>

                  {/* Right: 70% Investment & Gold Card (Warm Amber Fill) */}
                  <div className="col-span-5 rounded-[16px] bg-gradient-to-b from-[#1F1E1B] to-[#161513] border border-[#F0AE55]/30 p-3 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(240,174,85,0.12)]">
                    <div className="relative z-10">
                      <span className="text-lg font-black text-[#F0AE55]">۷۰٪</span>
                      <p className="text-[10px] text-[#F0AE55] font-semibold mt-0.5">
                        سرمایه‌گذاری
                      </p>
                      <span className="text-[9px] text-[#A0A3AD]">طلا، ارز و سهام</span>
                    </div>
                    <div className="w-full bg-black/40 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#F0AE55] h-full w-[70%] shadow-[0_0_8px_#F0AE55]" />
                    </div>
                  </div>
                </div>

                {/* Horizon & Risk Temperature Slider (Media 2 exact reproduction) */}
                <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A0A3AD] text-[11px]">
                      دمای افق سرمایه‌گذاری و ریسک:
                    </span>
                    <span className="px-2 py-0.5 rounded-[8px] bg-[#F0AE55]/15 text-[#F0AE55] text-[10px] font-bold border border-[#F0AE55]/25">
                      تعادل طلایی
                    </span>
                  </div>

                  {/* Gradient Track Slider */}
                  <div className="relative h-6 flex items-center">
                    <div className="w-full h-3 rounded-full bg-gradient-to-l from-[#88A9BC] via-[#B8A382] to-[#E29D44] shadow-inner" />
                    <div
                      style={{ right: `${ambientRisk}%` }}
                      className="absolute w-5 h-5 rounded-full bg-[#F0F0F1] border-2 border-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.6)] cursor-pointer -translate-x-1/2"
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#707581]">
                    <span>رشد سریع (پویایی)</span>
                    <span>محافظه‌کار (پایداری)</span>
                  </div>
                </div>
              </div>

              {/* AI Narrative Preview Pill */}
              <div className="rounded-[14px] bg-[#101114] border border-[#F0AE55]/20 p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F0AE55]/15 flex items-center justify-center text-[#F0AE55] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-[#A0A3AD] leading-relaxed">
                  <span className="text-[#F0AE55] font-semibold">تحلیل دستیار هوشمند: </span>
                  با توجه به تورم دوره‌ای، بازتوزیع ۲۰ میلیون تومان نقدینگی مازاد به صندوق طلا، قدرت خرید شما را تثبیت می‌کند.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. REAL-TIME MARKET OVERVIEW SECTION (Part 7)             */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F0AE55]">
              <Coins className="w-3.5 h-3.5" />
              <span>پایش لحظه‌ای دارایی‌های پایه</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#F0F0F1]">
              دیده‌بان زنده بازارهای مالی
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A3AD]">
              قیمت‌های لحظه‌ای متصل به سیستم پشتیبان تئا، بدون تاخیر و مبنای محاسبه سبدهای دارایی.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/markets"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0AE55] hover:text-[#F3BE76] transition-colors"
            >
              <span>مشاهده همه ابزارها و مبدل طلا</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live quote cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spotlightQuotes.map((q) => {
            const isPos = (q.change_percent || 0) >= 0;
            const priceNum = Number(q.price);

            return (
              <Link
                key={q.symbol}
                href={`/markets/${q.symbol}`}
                className="group rounded-[18px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/30 hover:bg-[#181A20] p-4.5 flex flex-col justify-between space-y-3 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#707581]">
                      {q.symbol}
                    </span>
                    <h3 className="text-xs font-bold text-[#F0F0F1] group-hover:text-[#F0AE55] transition-colors">
                      {q.name}
                    </h3>
                  </div>

                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-[6px] text-[10px] font-bold flex items-center gap-1",
                      isPos
                        ? "bg-[#76A98C]/15 text-[#76A98C]"
                        : "bg-[#C77A82]/15 text-[#C77A82]"
                    )}
                  >
                    {isPos ? "+" : ""}
                    {q.change_percent !== null && q.change_percent !== undefined
                      ? q.change_percent.toFixed(2)
                      : "0.00"}
                    %
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-white/[0.04]">
                  <div>
                    <span className="text-base font-black text-[#F0F0F1] font-mono">
                      {q.unit === "دلار"
                        ? `$${priceNum.toLocaleString()}`
                        : priceNum.toLocaleString("fa-IR")}
                    </span>{" "}
                    <span className="text-[10px] text-[#A0A3AD]">{q.unit}</span>
                  </div>

                  <Sparkline isPositive={isPos} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE PRODUCT DEMO SECTION (Part 9)              */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1D22] text-[#F0AE55] text-xs font-semibold border border-white/[0.08]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربه کاربری واقعی</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#F0F0F1]">
            کنترل مالی مانند یک ابزار دقیق و مهندسی‌شده
          </h2>
          <p className="text-xs sm:text-sm text-[#A0A3AD]">
            بر روی هر یک از بخش‌های زیر کلیک کنید تا نحوه تعامل و نمایش داده‌ها را در سامانه Theia مشاهده نمایید.
          </p>
        </div>

        {/* Interactive Tabs Header */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-[16px] bg-[#141519] border border-white/[0.08] gap-1">
            {[
              { id: "portfolio", label: "دارایی‌ها و پورتفولیو", icon: PieChart },
              { id: "cashflow", label: "جریان نقدینگی و بودجه", icon: ArrowDownUp },
              { id: "health", label: "سلامت مالی (Ambient)", icon: Activity },
              { id: "trajectory", label: "مسیر ثروت (Trajectory)", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = demoTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDemoTab(tab.id as typeof demoTab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-[#F0AE55] text-[#0D0E10] shadow-[0_0_14px_rgba(240,174,85,0.3)]"
                      : "text-[#A0A3AD] hover:text-[#F0F0F1] hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="rounded-[26px] bg-[#141519] border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Tag note */}
          <div className="absolute top-4 left-6 text-[10px] text-[#707581] font-mono">
            [ داده‌های دمو جهت نمایش تعاملی ]
          </div>

          {demoTab === "portfolio" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-white/[0.06]">
                  <span className="text-xs text-[#A0A3AD]">طلای ۱۸ عیار و سکه</span>
                  <p className="text-xl font-black text-[#F0AE55] mt-1 font-mono">
                    ۴۳۵,۰۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#76A98C]">۵۱.۴٪ کل پورتفولیو</span>
                </div>
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-white/[0.06]">
                  <span className="text-xs text-[#A0A3AD]">سپرده‌های بانکی و نقدینگی</span>
                  <p className="text-xl font-black text-[#F0F0F1] mt-1 font-mono">
                    ۲۵۰,۰۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#88A9BC]">۲۹.۵٪ کل پورتفولیو</span>
                </div>
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-white/[0.06]">
                  <span className="text-xs text-[#A0A3AD]">ارز و دارایی‌های بین‌المللی</span>
                  <p className="text-xl font-black text-[#76A98C] mt-1 font-mono">
                    ۱۶۰,۰۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#76A98C]">۱۹.۱٪ کل پورتفولیو</span>
                </div>
              </div>

              {/* Composition Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#A0A3AD]">
                  <span>تخصیص ساختار دارایی‌ها</span>
                  <span className="text-[#F0AE55] font-semibold">پوشش کامل ریسک تورم</span>
                </div>
                <div className="h-4 w-full rounded-full bg-black/40 overflow-hidden flex">
                  <div style={{ width: "51.4%" }} className="bg-[#F0AE55]" title="طلا" />
                  <div style={{ width: "29.5%" }} className="bg-[#88A9BC]" title="بانک" />
                  <div style={{ width: "19.1%" }} className="bg-[#76A98C]" title="ارز" />
                </div>
              </div>
            </div>
          )}

          {demoTab === "cashflow" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-white/[0.06]">
                  <span className="text-xs text-[#76A98C]">ورودی جریان نقدی (درآمد)</span>
                  <p className="text-xl font-black text-[#76A98C] mt-1 font-mono">
                    +۵۵,۰۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#707581]">حقوق ثابت و سود سرمایه‌گذاری</span>
                </div>
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-white/[0.06]">
                  <span className="text-xs text-[#C77A82]">کل هزینه‌ها و اقساط وام</span>
                  <p className="text-xl font-black text-[#C77A82] mt-1 font-mono">
                    -۳۴,۸۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#707581]">هزینه معیشت و خدمت بدهی</span>
                </div>
                <div className="rounded-[18px] bg-[#18191E] p-4 border border-[#F0AE55]/30">
                  <span className="text-xs text-[#F0AE55]">جریان نقدی آزاد مازاد</span>
                  <p className="text-xl font-black text-[#F0AE55] mt-1 font-mono">
                    +۲۰,۲۰۰,۰۰۰ تومان
                  </p>
                  <span className="text-[10px] text-[#F0AE55]">آماده جهت سرمایه‌گذاری دوره‌ای</span>
                </div>
              </div>
            </div>
          )}

          {demoTab === "health" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-[18px] bg-[#18191E] p-5 border border-white/[0.06] text-center space-y-2">
                <span className="text-xs text-[#A0A3AD]">نسبت سلامت نقدینگی (Runway)</span>
                <p className="text-3xl font-black text-[#76A98C]">۷.۲ ماه</p>
                <p className="text-[11px] text-[#707581]">پوشش کامل هزینه‌های ضروری در حالت اضطرار</p>
              </div>
              <div className="rounded-[18px] bg-[#18191E] p-5 border border-white/[0.06] text-center space-y-2">
                <span className="text-xs text-[#A0A3AD]">نسبت بدهی به درآمد (DTI)</span>
                <p className="text-3xl font-black text-[#F0AE55]">۲۴.۵٪</p>
                <p className="text-[11px] text-[#707581]">در محدوده ایمن و استاندارد بانکی</p>
              </div>
              <div className="rounded-[18px] bg-[#18191E] p-5 border border-white/[0.06] text-center space-y-2">
                <span className="text-xs text-[#A0A3AD]">نرخ تبدیل به دارایی سرمایه‌ای</span>
                <p className="text-3xl font-black text-[#88A9BC]">۳۶.۷٪</p>
                <p className="text-[11px] text-[#707581]">پس‌انداز مؤثر هدایت شده به رشد ثروت</p>
              </div>
            </div>
          )}

          {demoTab === "trajectory" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A0A3AD]">روند استهلاک وام‌ها در برابر انباشت ثروت خالص:</span>
                <span className="text-[#F0AE55] font-mono">نقطه آزادی از بدهی: اردیبهشت ۱۴۰۶</span>
              </div>
              <div className="h-44 w-full rounded-[18px] bg-[#101114] p-4 flex items-end justify-between gap-3 border border-white/[0.05]">
                {[
                  { m: "اکنون", debt: 80, wealth: 35 },
                  { m: "۶ ماه", debt: 65, wealth: 45 },
                  { m: "۱۲ ماه", debt: 50, wealth: 60 },
                  { m: "۱۸ ماه", debt: 35, wealth: 75 },
                  { m: "۲۴ ماه", debt: 15, wealth: 95 },
                  { m: "۳۶ ماه", debt: 0, wealth: 130 },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div
                        style={{ height: `${Math.min(100, item.debt)}%` }}
                        className="w-3 rounded-t-[4px] bg-[#C77A82] opacity-80"
                        title="مانده بدهی"
                      />
                      <div
                        style={{ height: `${Math.min(100, item.wealth)}%` }}
                        className="w-3 rounded-t-[4px] bg-[#F0AE55] shadow-[0_0_8px_rgba(240,174,85,0.4)]"
                        title="ارزش خالص"
                      />
                    </div>
                    <span className="text-[10px] text-[#707581]">{item.m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FINANCIAL TRAJECTORY SECTION (Part 10)                 */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] bg-gradient-to-br from-[#16171C] via-[#141519] to-[#101114] border border-white/[0.08] p-8 sm:p-12 space-y-10 relative overflow-hidden">
          {/* Subtle glow behind chart */}
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] text-xs font-semibold border border-[#F0AE55]/30">
                <Layers className="w-3.5 h-3.5" />
                <span>ماژول امضای تئا (The Signature Feature)</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#F0F0F1] leading-tight">
                آینده مالی خود را با سناریوهای ریاضی شفاف کنید
              </h2>

              <p className="text-xs sm:text-sm text-[#A0A3AD] leading-relaxed">
                تصمیم‌های مالی امروز (مانند دریافت یک وام جدید، خرید طلا یا افزایش ۱۰ درصدی پس‌انداز)، چه تاثیری در ثروت ۵ سال آینده شما دارند؟ ماژول Wealth Trajectory مسیر ثروت شما را با فرمول‌های آماری و ریاضی بدون حدس و گمان شبیه‌سازی می‌کند.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-2.5 text-[#E8E8E8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F0AE55]" />
                  <span>سناریوی مبنا (Baseline): بر پایه تداوم جریان فعلی درآمد و هزینه</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#E8E8E8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#76A98C]" />
                  <span>سناریوی پویا (Optimistic): بازدهی مضاعف سبد طلا و مهار مخارج</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#E8E8E8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#88A9BC]" />
                  <span>سناریوی محافظه‌کار (Conservative): شرایط رکود و هزینه فرصت</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_20px_rgba(240,174,85,0.3)]"
                >
                  <span>آینده مالی خود را بررسی کنید</span>
                  <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                </Link>
              </div>
            </div>

            {/* Trajectory Graphic Line Representation */}
            <div className="lg:col-span-7 rounded-[22px] bg-[#0E0F12] border border-white/[0.08] p-6 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-3">
                <span className="font-bold text-[#F0F0F1]">نمودار تلاقی ثروت (Trajectory Forecast)</span>
                <span className="text-[#F0AE55] font-mono text-[11px]">بازه: ۱ الی ۵ سال</span>
              </div>

              <div className="h-56 w-full relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  {/* Historical Line */}
                  <path
                    d="M 20 160 Q 80 155, 140 145 T 220 130"
                    fill="none"
                    stroke="#A0A3AD"
                    strokeWidth="3"
                  />

                  {/* Today Vertical Divider */}
                  <line x1="220" y1="20" x2="220" y2="180" stroke="#F0AE55" strokeDasharray="3 3" strokeWidth="1.5" />
                  <text x="215" y="195" fill="#F0AE55" fontSize="10" textAnchor="end">امروز</text>

                  {/* Future Forecast Scenarios */}
                  {/* Optimistic Line (Green) */}
                  <path
                    d="M 220 130 C 280 100, 360 60, 480 30"
                    fill="none"
                    stroke="#76A98C"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  {/* Baseline Line (Amber Glowing) */}
                  <path
                    d="M 220 130 C 280 115, 360 90, 480 70"
                    fill="none"
                    stroke="#F0AE55"
                    strokeWidth="3.5"
                  />
                  {/* Conservative Line (Blue) */}
                  <path
                    d="M 220 130 C 280 130, 360 125, 480 115"
                    fill="none"
                    stroke="#88A9BC"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />

                  {/* Crossover point circle */}
                  <circle cx="360" cy="90" r="5" fill="#F0AE55" stroke="#0D0E10" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#707581] pt-2 border-t border-white/[0.04]">
                <span>گذشته (ثبت شده)</span>
                <span className="text-[#F0AE55] font-semibold">تخمین آینده با قطعیت آماری</span>
                <span>۵ سال آینده</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. AI FINANCIAL ASSISTANT SHOWCASE (Part 11)              */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-[26px] bg-[#141519] border border-white/[0.08] p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1E24] text-[#F0AE55] text-xs font-semibold border border-white/[0.08]">
              <Bot className="w-3.5 h-3.5" />
              <span>هوش مصنوعی بدون توهم و سوگیری</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#F0F0F1]">
              یک دستیار خردمند برای درک تصمیم‌های مالی
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A3AD]">
              پاسخ به سوالات پولی شما بر مبنای توابع قطعی ریاضی پورتفولیو، نه ادعاهای خیالی بازارهای مالی.
            </p>
          </div>

          {/* Example AI Conversation Card */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* User Message */}
            <div className="rounded-[18px] bg-[#1C1E24] border border-white/[0.07] p-4 text-xs sm:text-sm text-[#F0F0F1] leading-relaxed mr-6">
              <span className="text-[10px] text-[#F0AE55] font-bold block mb-1">
                پرسش نمونه کاربر:
              </span>
              "اگر هر ماه ۱۵٪ بیشتر پس‌انداز کنم، وضعیت مالی من در پنج سال آینده چگونه تغییر می‌کند؟"
            </div>

            {/* AI Assistant Message */}
            <div className="rounded-[18px] bg-gradient-to-r from-[#17181D] to-[#121316] border border-[#F0AE55]/30 p-5 text-xs sm:text-sm text-[#D1D3D9] leading-loose space-y-3 ml-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 text-[#F0AE55] font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#F0AE55]" />
                <span>تحلیل مبتنی بر مدل ریاضی تئا:</span>
              </div>

              <p>
                بر مبنای متوسط درآمد خالص ماهانه فعلی شما، افزایش ۱۵ درصدی پس‌انداز معادل{" "}
                <strong className="text-[#F0AE55]">۷,۲۰۰,۰۰۰ تومان</strong> در ماه خواهد بود.
              </p>

              <div className="rounded-[12px] bg-[#0E0F12] p-3 space-y-1.5 text-xs text-[#A0A3AD]">
                <div className="flex justify-between">
                  <span>ارزش انباشته پس‌انداز خام (۵ ساله):</span>
                  <span className="font-bold text-[#F0F0F1]">۴۳۲,۰۰۰,۰۰۰ تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>ارزش بازتوزیع شده در سبد متعادل (با فرض بازده ۲۲٪):</span>
                  <span className="font-bold text-[#76A98C]">۷۱۵,۴۰۰,۰۰۰ تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>تسریع تاریخ آزادی کامل از وام‌ها:</span>
                  <span className="font-bold text-[#F0AE55]">۱۴ ماه زودتر</span>
                </div>
              </div>

              <p className="text-[11px] text-[#707581]">
                * توجه: این تحلیل صرفاً شبیه‌سازی عددی بر اساس متغیرهای فرضی است و تعهدی برای بازدهی آینده ایجاد نمی‌کند.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. EDUCATIONAL INSIGHTS & ARTICLES (Part 12)             */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#F0AE55]">
              دانش مالی و راهنماهای کاربردی
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#F0F0F1]">
              آخرین تحلیل‌ها و مقالات آموزشی
            </h2>
          </div>

          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0AE55] hover:text-[#F3BE76] transition-colors"
          >
            <span>مشاهده همه مقالات و تحلیل‌ها</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((art) => (
            <Link
              key={art.slug}
              href={`/insights/${art.slug}`}
              className="group rounded-[22px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/30 hover:bg-[#18191E] p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] text-[#707581]">
                  <span className="text-[#F0AE55] font-semibold">
                    {art.categoryLabel}
                  </span>
                  <span>{art.readTimeMinutes} دقیقه مطالعه</span>
                </div>
                <h3 className="text-sm font-bold text-[#F0F0F1] group-hover:text-[#F0AE55] transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-[#A0A3AD] line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#707581]">
                <span>{art.author.name}</span>
                <span className="text-[#F0AE55] group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                  مطالعه <ArrowLeft className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. TRUST, PRIVACY & FINANCIAL INTEGRITY (Part 21)         */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-[26px] bg-[#141519] border border-white/[0.08] p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1D22] text-[#76A98C] text-xs font-semibold border border-white/[0.08]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تعهد اخلاقی و مهندسی داده</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F0F0F1]">
              چرا می‌توانید به پلتفرم Theia اطمینان کنید؟
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[18px] bg-[#18191E] p-5 space-y-2 border border-white/[0.05]">
              <Lock className="w-5 h-5 text-[#F0AE55]" />
              <h3 className="text-sm font-bold text-[#F0F0F1]">مالکیت مطلق داده‌ها</h3>
              <p className="text-xs text-[#A0A3AD] leading-relaxed">
                داده‌های مالی شما محرمانه بوده و در سرورهای ایزوله و رمزنگاری‌شده نگهداری می‌شوند. ما هرگز داده‌ها را به شخص ثالث واگذار نمی‌کنیم.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#18191E] p-5 space-y-2 border border-white/[0.05]">
              <Wallet className="w-5 h-5 text-[#76A98C]" />
              <h3 className="text-sm font-bold text-[#F0F0F1]">عدم درخواست دسترسی حساب</h3>
              <p className="text-xs text-[#A0A3AD] leading-relaxed">
                برای استفاده از تئا، هیچ نیازی به اتصال مستقیم رمز دوم یا دسترسی به حساب‌های بانکی نیست. شما کنترل کامل ورودی‌ها را در دست دارید.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#18191E] p-5 space-y-2 border border-white/[0.05]">
              <LineChart className="w-5 h-5 text-[#88A9BC]" />
              <h3 className="text-sm font-bold text-[#F0F0F1]">تفکیک واقعیت از برآورد</h3>
              <p className="text-xs text-[#A0A3AD] leading-relaxed">
                سامانه به طور شفاف تفاوت میان تراکنش‌های قطعی ثبت‌شده و شبیه‌سازی‌های آینده‌نگرانه را برای شما مرزبندی می‌کند.
              </p>
            </div>

            <div className="rounded-[18px] bg-[#18191E] p-5 space-y-2 border border-white/[0.05]">
              <CheckCircle2 className="w-5 h-5 text-[#F0AE55]" />
              <h3 className="text-sm font-bold text-[#F0F0F1]">محاسبات ریاضی اعشاری قطعی</h3>
              <p className="text-xs text-[#A0A3AD] leading-relaxed">
                تمامی عملیات‌های پولی با مقیاس عددی استانداردهای بانکی (Python Decimal) محاسبه شده و دچار خطای گردکردن کامپیوتری نمی‌شوند.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FINAL HIGH-IMPACT CTA                                  */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] bg-gradient-to-r from-[#18191E] via-[#202229] to-[#18191E] border border-[#F0AE55]/30 p-10 md:p-16 text-center space-y-6 relative overflow-hidden shadow-[0_20px_70px_rgba(240,174,85,0.15)]">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.12)_0%,transparent_70%)] pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-[#F0F0F1] tracking-tight relative z-10">
            همین امروز فرماندهی امور مالی خود را آغاز کنید
          </h2>

          <p className="text-xs sm:text-sm text-[#A0A3AD] max-w-xl mx-auto leading-relaxed relative z-10">
            بدون هزینه، بدون پیچیدگی و در کمتر از یک دقیقه؛ تصویری روشن از تمام دارایی‌ها، بدهی‌ها و آینده مالی خود به دست آورید.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-4 rounded-[14px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-sm font-black transition-all shadow-[0_0_24px_rgba(240,174,85,0.4)] hover:shadow-[0_0_36px_rgba(240,174,85,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{isAuthenticated ? "ورود به مرکز فرماندهی شما" : "شروع رایگان و بی‌درنگ"}</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-4 rounded-[14px] bg-[#141518] hover:bg-[#1B1D22] text-[#F0F0F1] text-sm font-bold border border-white/[0.08] transition-all cursor-pointer"
              >
                <span>قبلاً ثبت‌نام کرده‌اید؟ ورود به سامانه</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
