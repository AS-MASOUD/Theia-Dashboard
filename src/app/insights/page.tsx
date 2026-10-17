"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  ArrowLeft,
  Sparkles,
  Tag,
  TrendingUp,
  User,
  ShieldCheck,
} from "lucide-react";
import { getAllInsights, InsightArticle } from "@/data/insights-data";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "همه مقالات" },
  { id: "personal-finance", label: "مدیریت ثروت و تورم" },
  { id: "gold-currency", label: "طلا و بازارهای جهانی" },
  { id: "debt-strategy", label: "استراتژی بدهی و وام" },
  { id: "ai-fintech", label: "فناوری و هوش مصنوعی" },
];

export default function InsightsIndexPage() {
  const articles = useMemo(() => getAllInsights(), []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesCat =
        selectedCategory === "all" || art.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>پایگاه دانش و بینش مالی تئا</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight leading-tight">
            سواد مالی عمیق، درک تورم و تصمیم‌گیری عقلانی
          </h1>
          <p className="text-sm md:text-base text-[#A0A3AD] leading-relaxed">
            مجموعه تحلیل‌ها و مقالات آموزشی تخصصی برای درک مکانیسم‌های بازار، استهلاک بدهی، مدیریت پورتفولیو و کاربرد هوش مصنوعی در اقتصاد شخصی.
          </p>
        </div>

        {/* Featured Article Card */}
        {featuredArticle && (
          <div className="relative rounded-[24px] border border-white/[0.09] bg-gradient-to-b from-[#18191E] to-[#121316] p-6 sm:p-10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] group hover:border-[#F0AE55]/40 transition-all duration-300">
            {/* Ambient warm lighting behind */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(240,174,85,0.12)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] font-semibold border border-[#F0AE55]/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    مقاله برگزیده هفته
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#222328] text-[#A0A3AD]">
                    {featuredArticle.categoryLabel}
                  </span>
                  <span className="flex items-center gap-1 text-[#707581]">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredArticle.readTimeMinutes} دقیقه مطالعه
                  </span>
                  <span className="flex items-center gap-1 text-[#707581]">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredArticle.publishedAt}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F0F0F1] leading-snug group-hover:text-[#F0AE55] transition-colors">
                  <Link href={`/insights/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="text-sm text-[#A0A3AD] leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#222328] border border-white/[0.08] flex items-center justify-center text-[#F0AE55] font-bold text-xs">
                      {featuredArticle.author.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F0F0F1]">
                        {featuredArticle.author.name}
                      </p>
                      <p className="text-[11px] text-[#707581]">
                        {featuredArticle.author.role}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/insights/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_20px_rgba(240,174,85,0.25)] hover:shadow-[0_0_26px_rgba(240,174,85,0.4)]"
                  >
                    <span>مطالعه کامل مقاله</span>
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>

              {/* Graphical Card Preview on side */}
              <div className="lg:col-span-4 rounded-[18px] bg-[#101114] border border-white/[0.07] p-5 space-y-4">
                <p className="text-xs font-bold text-[#E8E8E8] flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#76A98C]" />
                  نکات کلیدی این مقاله:
                </p>
                <ul className="space-y-3">
                  {featuredArticle.keyTakeaways.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#A0A3AD] flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55] mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
              placeholder="جستجو در مقالات..."
              className="w-full bg-[#151619] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] pr-10 pl-4 py-2 text-xs text-[#F0F0F1] placeholder-[#707581] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-[#141518] rounded-[22px] border border-white/[0.06]">
            <p className="text-sm font-semibold text-[#F0F0F1]">
              مقاله‌ای مطابق با جستجوی شما یافت نشد.
            </p>
            <p className="text-xs text-[#707581]">
              عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <article
                key={art.slug}
                className="group flex flex-col justify-between rounded-[22px] bg-[#141519] border border-white/[0.07] hover:border-white/[0.16] hover:bg-[#18191E] p-6 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-[#707581]">
                    <span className="px-2.5 py-1 rounded-[8px] bg-[#1E2025] text-[#F0AE55] font-medium border border-white/[0.04]">
                      {art.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTimeMinutes} دقیقه
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F0F0F1] leading-snug group-hover:text-[#F0AE55] transition-colors line-clamp-2">
                    <Link href={`/insights/${art.slug}`}>{art.title}</Link>
                  </h3>

                  <p className="text-xs text-[#A0A3AD] leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#1B1D21] border border-white/[0.08] flex items-center justify-center text-[11px] font-bold text-[#F0AE55]">
                      {art.author.name[0]}
                    </div>
                    <span className="text-xs text-[#707581] font-medium truncate max-w-[120px]">
                      {art.author.name}
                    </span>
                  </div>

                  <Link
                    href={`/insights/${art.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F0AE55] hover:text-[#F3BE76] transition-colors"
                  >
                    <span>مطالعه</span>
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Knowledge Bottom Banner */}
        <div className="rounded-[22px] bg-gradient-to-r from-[#17181D] via-[#1A1C22] to-[#17181D] border border-[#F0AE55]/20 p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-[#F0F0F1]">
            آماده‌اید دیدگاه مالی خود را به سطح بالاتری ارتقا دهید؟
          </h3>
          <p className="text-xs text-[#A0A3AD] max-w-xl mx-auto leading-relaxed">
            با ایجاد حساب رایگان در سامانه تئا، آموخته‌های مالی را روی دارایی‌ها و جریان نقدی واقعی خود پیاده‌سازی و شبیه‌سازی کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold shadow-[0_0_20px_rgba(240,174,85,0.25)] transition-all cursor-pointer"
            >
              <span>شروع رایگان با تئا</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
