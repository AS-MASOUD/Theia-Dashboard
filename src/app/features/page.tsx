"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PieChart,
  ShieldAlert,
  ArrowDownUp,
  LineChart,
  Bot,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Zap,
  Lock,
  Wallet,
  Activity,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES_DATA = [
  {
    id: "portfolio",
    icon: PieChart,
    badge: "ماژول تخصصی پورتفولیو",
    title: "تمام دارایی‌های شما، در یک نمای یکپارچه و هوشمند",
    headline:
      "یکپارچه‌سازی طلای فیزیکی، حساب‌های بانکی، سهام، رمزارز و دارایی‌های سرمایه‌ای",
    description:
      "دیگر نیازی به استفاده از چندین جدول اکسل یا اپلیکیشن‌های پراکنده نیست. در تئا، دارایی‌های شما به تفکیک طبقات دارایی (نقدی، سپر تورمی، سرمایه‌گذاری مولد) دسته‌بندی شده و ارزش روز آن‌ها بر مبنای آخرین قیمت‌های بازار محاسبه می‌شود.",
    highlights: [
      "محاسبه سود و زیان تحقق‌نیافته (Unrealized PnL) بر اساس بهای تمام‌شده متوسط",
      "پایش خودکار ارزش طلا و ارزها بر مبنای نرخ‌های لحظه‌ای",
      "تحلیل تنوع‌بخشی و ریسک تمرکز روی یک دارایی خاص",
      "پشتیبانی از چندین حساب بانکی و کارگزاری مختلف",
    ],
    visualType: "portfolio-demo",
  },
  {
    id: "liabilities",
    icon: ShieldAlert,
    badge: "ماژول تسهیلات و تعهدات",
    title: "تعهدات و وام‌های مالی خود را شفاف‌تر از همیشه مدیریت کنید",
    headline:
      "جدول دقیق استهلاک اقساط، تفکیک اصل و فرع بدهی و تخمین روز آزادی از بدهی (Debt-Free)",
    description:
      "تسهیلات بانکی و وام‌ها بخش جدایی‌ناپذیر اقتصاد تورمی هستند. ماژول بدهی‌ها به شما نشان می‌دهد چقدر از اقساط پرداخت شده، چقدر باقی مانده و هر قسط چه میزان از اصل بدهی را کاهش می‌دهد.",
    highlights: [
      "جدول استهلاک پیشرفته بر اساس فرمول‌های ریاضی بانکداری رسمی",
      "تخمین زمان صفر شدن بدهی‌ها (Debt-Free Date)",
      "هشدار سررسید اقساط و محاسبه نسبت خدمت بدهی (DTI)",
      "ثبت وام‌های خانوادگی و قرض‌الحسنه بدون کارمزد",
    ],
    visualType: "liability-demo",
  },
  {
    id: "cashflow",
    icon: ArrowDownUp,
    badge: "جریان نقدینگی و بودجه",
    title: "داستان مالی گذشته‌تان را با وضوح و دقت بالا ببینید",
    headline:
      "رهگیری دقیق ورودی‌ها و خروجی‌های پولی با دسته‌بندی‌های بصری و قابل تحلیل",
    description:
      "بدانید هر ماه پول شما از کجا آمده و دقیقا صرف چه اموری شده است. نمودارهای جریان نقدی به شما امکان می‌دهند سوراخ‌های پنهان بودجه را شناسایی کرده و نرخ پسانداز واقعی خود را افزایش دهید.",
    highlights: [
      "دسته‌بندی شفاف هزینه‌ها (خوراک، مسکن، حمل و نقل، آموزش)",
      "محاسبه نرخ پس‌انداز ماهانه (Savings Rate)",
      "شناسایی هزینه‌های تکرارشونده و اشتراک‌های غیرضروری",
      "تحلیل مازاد نقدینگی آزاد برای سرمایه‌گذاری مجدد",
    ],
    visualType: "cashflow-demo",
  },
  {
    id: "trajectory",
    icon: Layers,
    badge: "مسیر ثروت (Wealth Trajectory)",
    title: "آینده مالی خود را با سناریوهای مختلف شبیه‌سازی کنید",
    headline:
      "ترسیم تلاقی خط استهلاک بدهی و رشد سرمایه‌گذاری در افق ۱ تا ۵ ساله",
    description:
      "یکی از امضاهای منحصربه‌فرد سامانه Theia، ماژول مسیر ثروت است. این ابزار گذشته مالی شما را به آینده متصل می‌کند و سناریوهای رشد محافظه‌کارانه، مبنا و بهینه را بر اساس تصمیمات شما ترسیم می‌نماید.",
    highlights: [
      "محاسبه نقطه تلاقی ثروت (Crossover Date)",
      "شبیه‌سازی اثر اضافه کردن ۵ تا ۲۰ درصد به پس‌انداز ماهانه",
      "تحلیل اثر تورم بر قدرت خرید آینده",
      "بررسی سناریوی بازپرداخت زودهنگام وام‌ها در مقایسه با سرمایه‌گذاری مازاد",
    ],
    visualType: "trajectory-demo",
  },
  {
    id: "ai",
    icon: Bot,
    badge: "دستیار هوشمند مالی (AI)",
    title: "یک همراه خردمند برای تفسیر اعداد و درک تصمیم‌های پولی",
    headline:
      "تحلیل الگوهای هزینه‌کرد و پاسخ به پرسش‌های سناریویی بدون توهم و وعده پوچ",
    description:
      "دستیار هوشمند تئا سیگنال‌های فریبنده یا ادعاهای سود قطعی ارائه نمی‌دهد. در عوض، با اتصال امن به داده‌های حسابداری قطعی شما، به پرسش‌های کاربردی درباره سناریوهای پس‌انداز، وام و بودجه به زبان ساده پاسخ می‌دهد.",
    highlights: [
      "تحلیل زبان طبیعی درباره وضعیت پورتفولیو و تعهدات",
      "خلاصه‌سازی ماهانه رفتار مالی کاربر",
      "عدم افشای اطلاعات مالی و رعایت حریم خصوصی سرور",
      "محاسبه زمان تقریبی دستیابی به اهداف پس‌انداز",
    ],
    visualType: "ai-demo",
  },
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("portfolio");

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معماری ماژولار و مهندسی مالی پیشرفته</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight leading-tight">
            ابزارهای واقعی برای تسلط کامل بر ثروت و تصمیم‌گیری مالی
          </h1>
          <p className="text-sm md:text-base text-[#A0A3AD] leading-relaxed">
            از پایش زنده طلا و ارز تا شبیه‌سازی پیشرفته استهلاک وام و مسیر ثروت؛
            هر آنچه برای درک وضعیت مالی نیاز دارید در یک محیط یکپارچه گردآوری
            شده است.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-20">
          {FEATURES_DATA.map((feat, index) => {
            const Icon = feat.icon;
            const isEven = index % 2 === 0;

            return (
              <section
                key={feat.id}
                id={feat.id}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-12 gap-10 items-center rounded-[28px] bg-[#141519] border border-white/[0.08] p-6 sm:p-10 relative overflow-hidden",
                  index === 0 && "shadow-[0_20px_60px_rgba(240,174,85,0.06)]",
                )}
              >
                {/* Ambient glow in corner */}
                <div
                  className={cn(
                    "absolute w-72 h-72 pointer-events-none rounded-full",
                    isEven
                      ? "top-0 right-0 bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.08)_0%,transparent_70%)]"
                      : "bottom-0 left-0 bg-[radial-gradient(circle_at_center,rgba(118,169,140,0.08)_0%,transparent_70%)]",
                  )}
                />

                {/* Text Content */}
                <div
                  className={cn(
                    "space-y-6 relative z-10",
                    isEven ? "lg:col-span-7" : "lg:col-span-7 lg:order-2",
                  )}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1D22] border border-white/[0.08] text-xs font-semibold text-[#F0AE55]">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{feat.badge}</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#F0F0F1] leading-snug">
                      {feat.title}
                    </h2>
                    <p className="text-sm font-semibold text-[#F0AE55]">
                      {feat.headline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A0A3AD] leading-relaxed">
                    {feat.description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {feat.highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-[#E8E8E8]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#76A98C] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_18px_rgba(240,174,85,0.2)]"
                    >
                      <span>آزمایش این قابلیت در حساب رایگان</span>
                      <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                    </Link>
                  </div>
                </div>

                {/* Graphic Visual Representation */}
                <div
                  className={cn(
                    "relative z-10 rounded-[22px] bg-[#0E0F12] border border-white/[0.07] p-6 shadow-inner",
                    isEven ? "lg:col-span-5" : "lg:col-span-5 lg:order-1",
                  )}
                >
                  {/* Dynamic mock widget rendering */}
                  {feat.id === "portfolio" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold text-[#F0F0F1]">
                          ترکیب بهینه سبد (Ambient Mode)
                        </span>
                        <span className="text-[10px] text-[#F0AE55] px-2 py-0.5 rounded-full bg-[#F0AE55]/10 border border-[#F0AE55]/20">
                          فعال
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[16px] bg-[#18191E] p-4 space-y-2 border border-white/[0.05]">
                          <span className="text-[10px] text-[#A0A3AD]">
                            سپر نقدینگی امن
                          </span>
                          <p className="text-xl font-black text-[#F0F0F1]">
                            ۳۰٪
                          </p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#88A9BC] h-full w-[30%]" />
                          </div>
                        </div>
                        <div className="rounded-[16px] bg-[#18191E] p-4 space-y-2 border border-[#F0AE55]/30 shadow-[0_0_14px_rgba(240,174,85,0.1)]">
                          <span className="text-[10px] text-[#F0AE55]">
                            سرمایه‌گذاری و طلا
                          </span>
                          <p className="text-xl font-black text-[#F0AE55]">
                            ۷۰٪
                          </p>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#F0AE55] h-full w-[70%]" />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[16px] bg-[#18191E] p-4 space-y-2 border border-white/[0.05]">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#A0A3AD]">
                            مجموع ارزش پورتفولیو:
                          </span>
                          <span className="font-bold text-[#F0F0F1] font-mono">
                            ۸۴۵,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#A0A3AD]">
                            سود تحقق‌نیافته:
                          </span>
                          <span className="font-bold text-[#76A98C] font-mono">
                            +۱۲۸,۴۰۰,۰۰۰ تومان (+۱۷.۸٪)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {feat.id === "liabilities" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold text-[#F0F0F1]">
                          وام، اقساط و سررسیدهای مالی
                        </span>
                        <span className="text-[10px] text-[#C77A82] px-2 py-0.5 rounded-full bg-[#C77A82]/10 border border-[#C77A82]/20">
                          نیاز به توجه
                        </span>
                      </div>

                      <div className="rounded-[16px] bg-[#18191E] p-4 space-y-2 border border-white/[0.05]">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#A0A3AD]">
                            تسهیلات خرید مسکن:
                          </span>
                          <span className="font-bold text-[#F0F0F1]">
                            ۳۸۵,۷۰۰,۰۰۰ ت
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#707581]">
                          <span>قسط ماهانه: ۹,۴۵۰,۰۰۰ ت</span>
                          <span className="text-[#76A98C]">۶۴٪ تسویه‌شده</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#76A98C] h-full w-[64%]" />
                        </div>
                      </div>

                      <div className="rounded-[14px] bg-[#151619] p-3 text-center text-xs text-[#A0A3AD]">
                        <span>تاریخ پیش‌بینی آزادی از بدهی: </span>
                        <span className="font-bold text-[#F0AE55]">
                          ۱۴۰۶/۰۵/۲۲
                        </span>
                      </div>
                    </div>
                  )}

                  {feat.id === "cashflow" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold text-[#F0F0F1]">
                          جریان ماهانه نقدینگی
                        </span>
                        <span className="text-[10px] text-[#76A98C]">
                          مازاد مثبت
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#76A98C]">
                            درآمد ناخالص ماهانه
                          </span>
                          <span className="font-bold text-[#76A98C] font-mono">
                            +۴۸,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#C77A82]">
                            کل هزینه‌ها و اقساط
                          </span>
                          <span className="font-bold text-[#C77A82] font-mono">
                            -۳۱,۲۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.05] flex justify-between text-xs font-bold">
                          <span className="text-[#F0AE55]">
                            جریان نقدی آزاد (Free Cashflow)
                          </span>
                          <span className="text-[#F0AE55] font-mono">
                            +۱۶,۸۰۰,۰۰۰ تومان
                          </span>
                        </div>
                      </div>

                      <div className="rounded-[14px] bg-[#18191E] p-3 text-center text-xs text-[#A0A3AD]">
                        نرخ پسانداز ماه جاری:{" "}
                        <span className="text-[#76A98C] font-bold">۳۵٪</span>{" "}
                        (عالی)
                      </div>
                    </div>
                  )}

                  {feat.id === "trajectory" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <span className="text-xs font-bold text-[#F0F0F1]">
                          شبیه‌سازی مسیر ثروت (۵ ساله)
                        </span>
                        <span className="text-[10px] text-[#F0AE55]">
                          الگوریتم قطعی
                        </span>
                      </div>

                      <div className="h-32 flex items-end justify-between gap-2 px-2 pt-4">
                        {[
                          { year: "امروز", h: "35%", val: "۱x" },
                          { year: "۱ سال", h: "48%", val: "۱.۴x" },
                          { year: "۲ سال", h: "62%", val: "۱.۹x" },
                          { year: "۳ سال", h: "78%", val: "۲.۶x" },
                          { year: "۵ سال", h: "95%", val: "۴.۱x" },
                        ].map((b, i) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                          >
                            <span className="text-[10px] text-[#F0AE55] font-bold font-mono">
                              {b.val}
                            </span>
                            <div
                              style={{ height: b.h }}
                              className="w-full rounded-t-[6px] bg-gradient-to-t from-[#B37834] to-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.2)]"
                            />
                            <span className="text-[9px] text-[#707581]">
                              {b.year}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feat.id === "ai" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
                        <div className="w-2 h-2 rounded-full bg-[#F0AE55] animate-pulse" />
                        <span className="text-xs font-bold text-[#F0F0F1]">
                          پرسش کاربر از دستیار هوشمند
                        </span>
                      </div>

                      <div className="rounded-[14px] bg-[#18191E] p-3 text-xs text-[#E8E8E8]">
                        "اگر ماهانه ۱۰٪ بیشتر پس‌انداز کنم، ارزش خالص من در سال
                        آینده چقدر تغییر می‌کند؟"
                      </div>

                      <div className="rounded-[14px] bg-[#1A1C24] border border-[#F0AE55]/20 p-3 space-y-1.5 text-xs text-[#A0A3AD]">
                        <p className="text-[#F0AE55] font-semibold text-[11px] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          پاسخ تحلیلی تئا:
                        </p>
                        <p className="leading-relaxed">
                          با توجه به جریان نقدینگی فعلی، افزایش ۱۰ درصدی
                          پس‌انداز معادل ۴.۸ میلیون تومان در ماه است. با احتساب
                          نرخ بازده فرضی ۲۵٪ پورتفولیو، ارزش خالص شما تا پایان
                          سال آینده حدود ۶۵ میلیون تومان رشد مازاد خواهد داشت.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-[24px] bg-gradient-to-r from-[#17181D] via-[#1B1D23] to-[#17181D] border border-[#F0AE55]/30 p-10 text-center space-y-4">
          <h2 className="text-2xl font-black text-[#F0F0F1]">
            کنترل آینده مالی خود را از همین امروز آغاز کنید
          </h2>
          <p className="text-xs sm:text-sm text-[#A0A3AD] max-w-xl mx-auto leading-relaxed">
            ثبت‌نام کمتر از ۱ دقیقه زمان می‌برد. تمامی قابلیت‌های پایه به صورت
            کاملاً رایگان در اختیار شما قرار می‌گیرد.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_24px_rgba(240,174,85,0.35)]"
            >
              <span>ایجاد حساب کاربری رایگان</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
