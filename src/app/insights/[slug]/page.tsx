import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  getInsightBySlug,
  getRelatedInsights,
  getAllInsights,
} from "@/data/insights-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllInsights();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedInsights(article.slug, article.category);

  return (
    <article className="min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#707581]">
          <Link href="/" className="hover:text-[#F0AE55] transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link
            href="/insights"
            className="hover:text-[#F0AE55] transition-colors"
          >
            بینش و مقالات
          </Link>
          <span>/</span>
          <span className="text-[#A0A3AD] truncate max-w-[200px] sm:max-w-xs">
            {article.title}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-6 border-b border-white/[0.08] pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] font-semibold border border-[#F0AE55]/30">
              {article.categoryLabel}
            </span>
            <span className="flex items-center gap-1.5 text-[#A0A3AD]">
              <Calendar className="w-3.5 h-3.5 text-[#F0AE55]" />
              {article.publishedAt}
            </span>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1.5 text-[#A0A3AD]">
              <Clock className="w-3.5 h-3.5 text-[#F0AE55]" />
              {article.readTimeMinutes} دقیقه زمان مطالعه
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#F0F0F1] leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-[#A0A3AD] leading-relaxed font-normal">
            {article.excerpt}
          </p>

          {/* Author Card */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1B1D21] border border-white/[0.09] flex items-center justify-center text-[#F0AE55] font-bold text-sm shadow-[0_0_12px_rgba(240,174,85,0.15)]">
                {article.author.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[#F0F0F1]">
                  {article.author.name}
                </p>
                <p className="text-xs text-[#707581]">{article.author.role}</p>
              </div>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#A0A3AD] hover:text-[#F0AE55] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به فهرست مقالات</span>
            </Link>
          </div>
        </header>

        {/* Key Takeaways Box */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="rounded-[20px] bg-gradient-to-r from-[#17181D] to-[#121316] border border-[#F0AE55]/25 p-6 sm:p-8 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 text-[#F0AE55] font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#F0AE55]" />
              <span>نکات کلیدی و چکیده مدیریتی</span>
            </div>
            <ul className="space-y-3">
              {article.keyTakeaways.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-xs sm:text-sm text-[#E8E8E8] leading-relaxed"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F0AE55] mt-1.5 shrink-0 shadow-[0_0_8px_#F0AE55]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Content */}
        <div className="space-y-6 text-[#D1D3D9] text-sm sm:text-base leading-loose font-normal">
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-justify leading-8">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Product Integration Callout */}
        <div className="rounded-[22px] bg-[#151619] border border-white/[0.08] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#F0AE55] text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>چگونه این مفهوم را در سامانه تئا پیاده‌سازی کنیم؟</span>
          </div>
          <p className="text-xs sm:text-sm text-[#A0A3AD] leading-relaxed">
            شما می‌توانید در سامانه مدیریت مالی تئا، انواع دارایی‌های طلا، ارز،
            سهام و تعهدات اقساطی خود را به آسانی ثبت کنید تا سیستم به صورت
            خودکار نسبت‌های تعادلی و ارزش روز پورتفولیو را بر اساس نرخ‌های
            لحظه‌ای محاسبه و نمایش دهد.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_18px_rgba(240,174,85,0.25)]"
            >
              <span>آزمایش رایگان این ماژول در تئا</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {related.length > 0 && (
          <div className="pt-10 border-t border-white/[0.08] space-y-6">
            <h3 className="text-lg font-bold text-[#F0F0F1]">
              مقالات و تحلیل‌های مرتبط
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/insights/${rel.slug}`}
                  className="group rounded-[18px] bg-[#141518] border border-white/[0.06] hover:border-[#F0AE55]/30 p-5 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-medium text-[#F0AE55]">
                      {rel.categoryLabel}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#F0F0F1] group-hover:text-[#F0AE55] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#707581] pt-2 border-t border-white/[0.04]">
                    <span>{rel.readTimeMinutes} دقیقه</span>
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#F0AE55]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
