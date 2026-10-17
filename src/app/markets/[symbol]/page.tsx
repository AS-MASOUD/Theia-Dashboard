import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Coins,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  BarChart3,
} from "lucide-react";
import { FALLBACK_MARKET_RATES } from "@/data/market-data-fallback";
import { MarketQuote } from "@/types/financial";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateStaticParams() {
  const all = [
    ...FALLBACK_MARKET_RATES.gold_and_coins,
    ...FALLBACK_MARKET_RATES.currencies,
    ...FALLBACK_MARKET_RATES.cryptocurrency,
    ...FALLBACK_MARKET_RATES.commodities,
  ];
  return all.map((q) => ({ symbol: q.symbol }));
}

export default async function MarketSymbolDetailPage({ params }: Props) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const allQuotes = [
    ...FALLBACK_MARKET_RATES.gold_and_coins,
    ...FALLBACK_MARKET_RATES.currencies,
    ...FALLBACK_MARKET_RATES.cryptocurrency,
    ...FALLBACK_MARKET_RATES.commodities,
  ];

  const quote = allQuotes.find(
    (q) => q.symbol.toUpperCase() === upperSymbol
  );

  if (!quote) {
    notFound();
  }

  const isPos = (quote.change_percent || 0) >= 0;
  const priceNum = Number(quote.price);

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#707581]">
          <Link href="/" className="hover:text-[#F0AE55] transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link href="/markets" className="hover:text-[#F0AE55] transition-colors">
            دیده‌بان بازارها
          </Link>
          <span>/</span>
          <span className="text-[#A0A3AD] font-mono">{quote.symbol}</span>
        </div>

        {/* Instrument Header */}
        <div className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-6 sm:p-10 space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle_at_top_right,rgba(240,174,85,0.1)_0%,transparent_70%)] pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-[#1E2025] text-[#F0AE55] border border-white/[0.06] font-semibold">
                  {quote.symbol}
                </span>
                <span className="text-xs text-[#707581]">
                  دسته: {quote.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#F0F0F1]">
                {quote.name}
              </h1>
              {quote.name_en && (
                <p className="text-xs text-[#A0A3AD] font-mono">
                  {quote.name_en}
                </p>
              )}
            </div>

            {/* Price Readout */}
            <div className="flex flex-col sm:items-end space-y-1">
              <span className="text-xs text-[#707581]">آخرین نرخ معامله شده:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#F0F0F1] font-mono">
                  {quote.unit === "دلار"
                    ? `$${priceNum.toLocaleString()}`
                    : priceNum.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs text-[#F0AE55] font-semibold">
                  {quote.unit}
                </span>
              </div>

              {/* Change badge */}
              <div
                className={cn(
                  "px-3 py-1 rounded-[8px] text-xs font-bold inline-flex items-center gap-1.5 mt-1",
                  isPos
                    ? "bg-[#76A98C]/15 text-[#76A98C] border border-[#76A98C]/30"
                    : "bg-[#C77A82]/15 text-[#C77A82] border border-[#C77A82]/30"
                )}
              >
                {isPos ? (
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span dir="ltr">
                  {isPos ? "+" : ""}
                  {quote.change_percent !== null && quote.change_percent !== undefined
                    ? quote.change_percent.toFixed(2)
                    : "0.00"}
                  %
                </span>
                <span className="text-[10px] opacity-80">در ۲۴ ساعت گذشته</span>
              </div>
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/[0.06] relative z-10">
            <div className="space-y-1">
              <span className="text-[11px] text-[#707581]">واحد اندازه‌گیری</span>
              <p className="text-sm font-semibold text-[#E8E8E8]">{quote.unit}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-[#707581]">دامنه تغییرات روزانه</span>
              <p className="text-sm font-semibold text-[#E8E8E8]">
                {isPos ? "صعودی / تقاضای فعال" : "نزولی / تثبیت قیمت"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-[#707581]">معادل تومانی تقریبی</span>
              <p className="text-sm font-semibold text-[#F0AE55] font-mono">
                {quote.price_toman
                  ? `${Number(quote.price_toman).toLocaleString("fa-IR")} ت`
                  : `${priceNum.toLocaleString("fa-IR")} ت`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-[#707581]">وضعیت فید داده</span>
              <p className="text-sm font-semibold text-[#76A98C] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#76A98C] animate-pulse" />
                پایدار و معتبر
              </p>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="rounded-[22px] bg-gradient-to-r from-[#17181D] to-[#121316] border border-[#F0AE55]/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-lg font-bold text-[#F0F0F1]">
              این دارایی را در دارایی‌های شخصی خود ثبت کنید
            </h3>
            <p className="text-xs text-[#A0A3AD] max-w-md">
              با ایجاد حساب کاربری در تئا، می‌توانید تعداد یا وزن دارایی خود از {quote.name} را ثبت نموده تا ارزش روز و سود تحقق‌نیافته آن به شکل لحظه‌ای محاسبه شود.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_20px_rgba(240,174,85,0.25)] shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.2]" />
            <span>ثبت رایگان دارایی در سامانه</span>
          </Link>
        </div>

        {/* Return Button */}
        <div className="text-center pt-4">
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#A0A3AD] hover:text-[#F0AE55] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>مشاهده سایر ابزارهای دیده‌بان بازار</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
