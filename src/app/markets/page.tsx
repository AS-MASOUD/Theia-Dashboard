"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Coins,
  DollarSign,
  ArrowUpDown,
  Clock,
  Sparkles,
  Layers,
  ArrowLeft,
  Sliders,
  Calculator,
  ChevronLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { FALLBACK_MARKET_RATES } from "@/data/market-data-fallback";
import { MarketQuote, MarketRatesResponse } from "@/types/financial";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "همه ابزارها" },
  { id: "gold_coin", label: "طلا و مسکوکات" },
  { id: "currency", label: "ارزهای شاخص" },
  { id: "crypto", label: "رمزارزها" },
  { id: "commodity", label: "فلزات و کالاها" },
];

function MiniSparkline({ isPositive }: { isPositive: boolean }) {
  const points = isPositive
    ? "0,22 15,18 30,20 45,12 60,15 75,8 90,10 105,4 120,2"
    : "0,4 15,6 30,12 45,10 60,18 75,15 90,20 105,18 120,24";

  return (
    <svg className="w-20 h-6 overflow-visible" viewBox="0 0 120 26">
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

export default function MarketsHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Converter state
  const [converterAmount, setConverterAmount] = useState<number>(10000000);
  const [converterFrom, setConverterFrom] = useState<string>("TOMAN");

  const {
    data: marketData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<MarketRatesResponse>({
    queryKey: ["public-market-rates"],
    queryFn: async () => {
      try {
        const res = await api.getMarketRates();
        return res;
      } catch {
        return FALLBACK_MARKET_RATES;
      }
    },
    initialData: FALLBACK_MARKET_RATES,
    refetchInterval: 30000,
  });

  const allQuotes: MarketQuote[] = useMemo(() => {
    if (!marketData) return [];
    return [
      ...(marketData.gold_and_coins || []),
      ...(marketData.currencies || []),
      ...(marketData.cryptocurrency || []),
      ...(marketData.commodities || []),
    ];
  }, [marketData]);

  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((item) => {
      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name_en &&
          item.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [allQuotes, selectedCategory, searchQuery]);

  // Converter Calculations
  const usdRate = Number(marketData?.usd_toman_rate || 94850);
  const gold18k =
    allQuotes.find((q) => q.symbol === "IR_GOLD_18K")?.price || 4385000;
  const emamiCoin =
    allQuotes.find((q) => q.symbol === "EMAMI_COIN")?.price || 51200000;
  const btcPriceUsd =
    allQuotes.find((q) => q.symbol === "BTC")?.price || 68450;

  const converterOutputs = useMemo(() => {
    let baseToman = converterAmount;
    if (converterFrom === "USD") baseToman = converterAmount * usdRate;
    else if (converterFrom === "GOLD_GRAM")
      baseToman = converterAmount * Number(gold18k);
    else if (converterFrom === "COIN")
      baseToman = converterAmount * Number(emamiCoin);

    return {
      toman: Math.round(baseToman),
      usd: (baseToman / usdRate).toFixed(2),
      goldGrams: (baseToman / Number(gold18k)).toFixed(3),
      emamiCoins: (baseToman / Number(emamiCoin)).toFixed(2),
      btc: (baseToman / (Number(btcPriceUsd) * usdRate)).toFixed(6),
    };
  }, [converterAmount, converterFrom, usdRate, gold18k, emamiCoin, btcPriceUsd]);

  const lastUpdatedDisplay = useMemo(() => {
    if (!marketData?.last_sync_time) return "لحظاتی پیش";
    try {
      const d = new Date(marketData.last_sync_time);
      return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "لحظاتی پیش";
    }
  }, [marketData]);

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
              <Coins className="w-3.5 h-3.5" />
              <span>پایگاه رصد داده‌های مالی و نرخ‌های زنده</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
              دیده‌بان جامع بازارهای مالی
            </h1>
            <p className="text-xs md:text-sm text-[#A0A3AD] leading-relaxed">
              نرخ‌های رسمی و لحظه‌ای طلای ۱۸ عیار، انواع مسکوکات، ارزهای آزاد و مبادله‌ای، رمزارزها و فلزات اساسی، متصل به فید پایدار شبکه تئا.
            </p>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-left text-xs text-[#707581]">
              <span className="text-[11px]">آخرین همگام‌سازی داده:</span>
              <span className="font-semibold text-[#E8E8E8]">{lastUpdatedDisplay}</span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2.5 rounded-[12px] bg-[#151619] hover:bg-[#1B1D21] border border-white/[0.08] text-[#F0AE55] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="به‌روزرسانی داده‌ها"
            >
              <RefreshCw
                className={cn("w-4 h-4", isRefetching && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* Highlight Ticker Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-[16px] bg-[#141518] border border-white/[0.07] p-4 flex flex-col justify-between">
            <span className="text-[11px] text-[#A0A3AD]">طلای ۱۸ عیار (هر گرم)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-base font-extrabold text-[#F0F0F1]">
                {Number(gold18k).toLocaleString("fa-IR")}
              </span>
              <span className="text-[11px] text-[#F0AE55]">تومان</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-[#141518] border border-white/[0.07] p-4 flex flex-col justify-between">
            <span className="text-[11px] text-[#A0A3AD]">سکه تمام امامی</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-base font-extrabold text-[#F0F0F1]">
                {Number(emamiCoin).toLocaleString("fa-IR")}
              </span>
              <span className="text-[11px] text-[#F0AE55]">تومان</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-[#141518] border border-white/[0.07] p-4 flex flex-col justify-between">
            <span className="text-[11px] text-[#A0A3AD]">دلار آمریکا (آزاد)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-base font-extrabold text-[#F0F0F1]">
                {Number(usdRate).toLocaleString("fa-IR")}
              </span>
              <span className="text-[11px] text-[#F0AE55]">تومان</span>
            </div>
          </div>
          <div className="rounded-[16px] bg-[#141518] border border-white/[0.07] p-4 flex flex-col justify-between">
            <span className="text-[11px] text-[#A0A3AD]">بیت‌کوین (BTC)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-base font-extrabold text-[#F0F0F1]">
                ${Number(btcPriceUsd).toLocaleString()}
              </span>
              <span className="text-[11px] text-[#76A98C] font-semibold">USD</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-[11px] text-xs font-medium transition-all cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-[#F0AE55] text-[#0D0E10] font-bold shadow-[0_0_14px_rgba(240,174,85,0.2)]"
                    : "bg-[#151619] hover:bg-[#1B1D21] text-[#A0A3AD] hover:text-[#F0F0F1] border border-white/[0.05]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#707581] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو نماد یا نام ابزار..."
              className="w-full bg-[#151619] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] pr-10 pl-4 py-2 text-xs text-[#F0F0F1] placeholder-[#707581] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuotes.map((item) => {
            const isPos = (item.change_percent || 0) >= 0;
            const priceNum = Number(item.price);

            return (
              <Link
                key={item.symbol}
                href={`/markets/${item.symbol}`}
                className="group rounded-[20px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/40 hover:bg-[#181A20] p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden"
              >
                {/* Local ambient glow on hover */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-[#A0A3AD] uppercase">
                      {item.symbol}
                    </span>
                    <h3 className="text-sm font-bold text-[#F0F0F1] group-hover:text-[#F0AE55] transition-colors">
                      {item.name}
                    </h3>
                    {item.name_en && (
                      <p className="text-[10px] text-[#707581]">{item.name_en}</p>
                    )}
                  </div>

                  {/* Change badge */}
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-[8px] text-[11px] font-bold flex items-center gap-1",
                      isPos
                        ? "bg-[#76A98C]/15 text-[#76A98C] border border-[#76A98C]/25"
                        : "bg-[#C77A82]/15 text-[#C77A82] border border-[#C77A82]/25"
                    )}
                  >
                    {isPos ? (
                      <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                    )}
                    <span dir="ltr">
                      {isPos ? "+" : ""}
                      {item.change_percent !== null && item.change_percent !== undefined
                        ? item.change_percent.toFixed(2)
                        : "0.00"}
                      %
                    </span>
                  </div>
                </div>

                {/* Price Readout & Sparkline */}
                <div className="flex items-end justify-between pt-3 border-t border-white/[0.05]">
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-[#F0F0F1] font-mono">
                        {item.unit === "دلار"
                          ? `$${priceNum.toLocaleString()}`
                          : priceNum.toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[11px] text-[#A0A3AD]">
                        {item.unit}
                      </span>
                    </div>

                    {item.price_toman && item.unit === "دلار" && (
                      <p className="text-[10px] text-[#707581]">
                        معادل تقریبی: {Number(item.price_toman).toLocaleString("fa-IR")}{" "}
                        تومان
                      </p>
                    )}
                  </div>

                  <MiniSparkline isPositive={isPos} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Interactive Currency & Gold Calculator */}
        <div className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[rgba(240,174,85,0.12)] border border-[#F0AE55]/30 flex items-center justify-center text-[#F0AE55]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F0F0F1]">
                  ماشین‌حساب هوشمند تبدیل طلا، ارز و دارایی‌ها
                </h3>
                <p className="text-xs text-[#A0A3AD]">
                  محاسبه معادل ارزش دارایی شما بر اساس آخرین قیمت‌های اعلام‌شده در سامانه
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#F0AE55]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>محاسبه بلادرنگ و ریاضی قطعی</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input Side */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                  مقدار ورودی:
                </label>
                <input
                  type="number"
                  value={converterAmount}
                  onChange={(e) => setConverterAmount(Number(e.target.value) || 0)}
                  className="w-full bg-[#1B1D21] border border-white/[0.1] focus:border-[#F0AE55] rounded-[13px] px-4 py-3 text-sm font-bold text-[#F0F0F1] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                  واحد مبدأ:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "TOMAN", label: "تومان" },
                    { id: "USD", label: "دلار آمریکا" },
                    { id: "GOLD_GRAM", label: "گرم طلای ۱۸" },
                    { id: "COIN", label: "سکه امامی" },
                  ].map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setConverterFrom(unit.id)}
                      className={cn(
                        "py-2 rounded-[11px] text-xs font-semibold border transition-all cursor-pointer",
                        converterFrom === unit.id
                          ? "bg-[#F0AE55] text-[#0D0E10] border-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.25)]"
                          : "bg-[#18191E] text-[#A0A3AD] border-white/[0.06] hover:bg-[#202228]"
                      )}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Equals Icon */}
            <div className="lg:col-span-1 flex justify-center text-[#707581]">
              <div className="w-10 h-10 rounded-full bg-[#1B1D21] border border-white/[0.06] flex items-center justify-center text-[#F0AE55]">
                <ArrowUpDown className="w-4 h-4 rotate-90 lg:rotate-0" />
              </div>
            </div>

            {/* Results Output Side */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3">
              <div className="rounded-[16px] bg-[#18191E] border border-white/[0.06] p-4">
                <span className="text-[11px] text-[#A0A3AD]">معادل ریالی (تومان)</span>
                <p className="text-base font-extrabold text-[#F0F0F1] mt-1 font-mono">
                  {converterOutputs.toman.toLocaleString("fa-IR")}
                </p>
              </div>

              <div className="rounded-[16px] bg-[#18191E] border border-white/[0.06] p-4">
                <span className="text-[11px] text-[#A0A3AD]">معادل دلار آمریکا (USD)</span>
                <p className="text-base font-extrabold text-[#76A98C] mt-1 font-mono">
                  ${Number(converterOutputs.usd).toLocaleString()}
                </p>
              </div>

              <div className="rounded-[16px] bg-[#18191E] border border-white/[0.06] p-4">
                <span className="text-[11px] text-[#A0A3AD]">معادل گرم طلای ۱۸</span>
                <p className="text-base font-extrabold text-[#F0AE55] mt-1 font-mono">
                  {Number(converterOutputs.goldGrams).toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-normal">گرم</span>
                </p>
              </div>

              <div className="rounded-[16px] bg-[#18191E] border border-white/[0.06] p-4">
                <span className="text-[11px] text-[#A0A3AD]">معادل سکه تمام امامی</span>
                <p className="text-base font-extrabold text-[#F0F0F1] mt-1 font-mono">
                  {Number(converterOutputs.emamiCoins).toLocaleString("fa-IR")}{" "}
                  <span className="text-xs font-normal">عدد</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Call to action */}
        <div className="rounded-[22px] bg-gradient-to-r from-[#17181D] via-[#1B1D23] to-[#17181D] border border-white/[0.08] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-lg font-bold text-[#F0F0F1]">
              می‌خواهید دارایی‌های واقعی خود را با این قیمت‌ها بسنجید؟
            </h3>
            <p className="text-xs text-[#A0A3AD]">
              با ثبت دارایی‌های خود در پلتفرم Personal FC، ارزش خالص، سود و زیان تحقق‌نیافته و تخصیص بهینه پورتفولیوی شما به صورت زنده محاسبه می‌شود.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_20px_rgba(240,174,85,0.25)] shrink-0"
          >
            شروع پایش سبد دارایی
          </Link>
        </div>
      </div>
    </div>
  );
}
