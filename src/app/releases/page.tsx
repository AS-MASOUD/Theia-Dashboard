import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowLeft, GitCommit } from "lucide-react";

export default function ReleasesPage() {
  const changelog = [
    {
      version: "v0.1.0 (نسخه پیش‌نمایش فعلی)",
      date: "مهر ۱۴۰۵",
      badge: "جدیدترین انتشار",
      highlights: [
        "راه‌اندازی کامل صفحه عمومی (Landing Page) و دیده‌بان زنده بازارهای مالی بدون نیاز به ورود",
        "طراحی و پیاده‌سازی دیده‌بان نرخ‌های زنده طلا ۱۸ عیار، انواع سکه، ارزهای آزاد و کریپتو (BRS API)",
        "معماری ایزوله و مستقل برای ماژول‌های مسیر ثروت (Wealth Trajectory) و دستیار هوشمند (AI)",
        "پیاده‌سازی حالت تعادلی سبد دارایی (Ambient Mode) با الهام از استانداردهای مدرن مینی‌مال تیره",
        "محاسبه جدول استهلاک وام‌ها بر اساس فرمول‌های ریاضی و تعیین روز رهایی از بدهی (Debt-Free Date)",
        "استفاده از فونت محلی کلمه (Kalameh) با دسترسی صفر به منابع مسدود خارجی",
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <GitCommit className="w-3.5 h-3.5" />
            <span>تاریخچه تغییرات سامانه تئا</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            یادداشت‌های انتشار و تغییرات نسخه‌ها
          </h1>
          <p className="text-sm text-[#A0A3AD]">
            گزارش تغییرات و بهینه‌سازی‌های اعمال‌شده در هر نسخه پلتفرم Personal FC.
          </p>
        </div>

        <div className="space-y-8">
          {changelog.map((rel, i) => (
            <div
              key={i}
              className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-8 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#F0F0F1]">{rel.version}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] text-[10px] font-bold border border-[#F0AE55]/30">
                      {rel.badge}
                    </span>
                  </div>
                  <span className="text-xs text-[#707581] mt-1 block">تاریخ انتشار: {rel.date}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {rel.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#E8E8E8] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#76A98C] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
