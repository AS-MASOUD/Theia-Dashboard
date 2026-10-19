"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "سامانه مدیریت مالی تئا دقیقاً چه کاری انجام می‌دهد؟",
    a: "تئا یک سامانه مدیریت و دستیار هوشمند مدیریت ثروت شخصی است. این پلتفرم دارایی‌های گوناگون شما (طلا، ارز، رمزارز، حساب‌های بانکی، سهام)، تعهدات و وام‌ها، و درآمدها و هزینه‌های شما را در یک نمای واحد تجمیع نموده و با استفاده از نرخ‌های زنده بازار و مدل‌سازی آماری، مسیر آینده ثروت شما را شبیه‌سازی می‌کند.",
  },
  {
    q: "آیا برای استفاده از تئا باید رمز حساب یا کارت بانکی خود را وارد کنم؟",
    a: "خیر، به هیچ وجه. تئا هیچ‌گونه دسترسی به اطلاعات محرمانه بانکی، رمز دوم یا حساب‌های شما ندارد و نخواهد داشت. شما تنها مبالغ و تعداد دارایی‌ها یا اقساط خود را وارد می‌کنید و سیستم محاسبات تحلیلی را انجام می‌دهد.",
  },
  {
    q: "ماژول مسیر ثروت (Wealth Trajectory) چگونه آینده را پیش‌بینی می‌کند؟",
    a: "این ماژول بر پایه فرمول‌های دقیق استهلاک بدهی بانکی و نرخ رشد مرکب دارایی‌ها عمل می‌کند. تئا با دریافت اطلاعات درآمد، مازاد نقدینگی ماهانه و نرخ بازده پورتفولیو، سه سناریوی خوش‌بینانه، مبنا و محافظه‌کارانه را محاسبه کرده و زمان دقیق صفر شدن بدهی‌ها و رشد دارایی‌ها را نمایش می‌دهد.",
  },
  {
    q: "قیمت‌های طلا، ارز و رمزارزها از چه منبعی تامین می‌شوند؟",
    a: "سامانه به صورت دوره‌ای و خودکار، آخرین نرخ‌های رسمی طلای ۱۸ عیار، انواع سکه، ارزهای آزاد و مبادله‌ای، و رمزارزهای شاخص را از طریق فید پایدار و معتبر شبکه BRS همگام‌سازی می‌نماید.",
  },
  {
    q: "حالت تعادلی (Ambient Mode) در پورتفولیو به چه معناست؟",
    a: "حالت تعادلی بر اساس دمای ریسک و افق زمانی شما، دارایی‌ها را میان دو ستون «سپر نقدینگی امن» (۳۰٪) و «دارایی‌های ضد تورم و رشد» (۷۰٪) متعادل می‌کند تا در صورت جهش‌های ارزی یا رکود، پورتفولیوی شما متضرر نشود.",
  },
  {
    q: "آیا در آینده اطلاعات من از بین می‌رود یا قابل خروجی گرفتن است؟",
    a: "داده‌های شما در سرورهای امن با استانداردهای نسخه ۰.۱.۰ و بانک اطلاعاتی PostgreSQL محافظت می‌شوند و در هر زمان امکان خروجی گرفتن از کل تراکنش‌ها در قالب فایل استاندارد اکسل/CSV میسر است.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>مرکز پاسخ به پرسش‌ها</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            سوالات متداول کاربران
          </h1>
          <p className="text-sm text-[#A0A3AD] leading-relaxed">
            پاسخ به سوالات پرتکرار پیرامون نحوه کارکرد سامانه تئا، امنیت و
            قابلیت‌ها.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-[20px] bg-[#141519] border border-white/[0.07] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-right cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-bold text-[#F0F0F1] leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-[#F0AE55] shrink-0 transition-transform duration-200 mr-2",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A0A3AD] leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-[22px] bg-[#151619] border border-white/[0.08] p-8 text-center space-y-4">
          <h3 className="text-base font-bold text-[#F0F0F1]">
            سوال دیگری دارید که در اینجا پاسخ داده نشده است؟
          </h3>
          <p className="text-xs text-[#A0A3AD]">
            تیم پشتیبانی ما با اشتیاق آماده پاسخگویی و راهنمایی شماست.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all"
            >
              <span>تماس با واحد پشتیبانی</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
