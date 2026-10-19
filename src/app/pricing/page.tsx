"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  Coins,
  Bot,
  Layers,
  LineChart,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const COMPARISON_FEATURES = [
  {
    name: "داشبورد مدیریت (Overview)",
    free: "کامل",
    pro: "پیشرفته و اختصاصی",
  },
  {
    name: "تعداد دارایی‌ها و پورتفولیو",
    free: "تا ۱۵ موقعیت دارایی",
    pro: "نامحدود",
  },
  {
    name: "ثبت حساب‌های بانکی و نقدینگی",
    free: "تا ۳ حساب",
    pro: "نامحدود",
  },
  {
    name: "رهگیری وام‌ها و جدول استهلاک",
    free: "پایه (تا ۲ وام)",
    pro: "پیشرفته + تاریخ Debt-Free",
  },
  {
    name: "نرخ‌های زنده طلا، ارز و کریپتو",
    free: "روزانه",
    pro: "بلادرنگ + هشدارهای قیمتی",
  },
  {
    name: "افق شبیه‌سازی مسیر ثروت (Trajectory)",
    free: "تا ۶ ماه آینده",
    pro: "تا ۵ سال آینده + ۳ سناریو",
  },
  {
    name: "دستیار هوشمند مالی (AI)",
    free: "۱۰ پرسش ماهانه",
    pro: "نامحدود با تحلیل عمیق",
  },
  {
    name: "حالت تعادلی سبد (Ambient Mode)",
    free: "پیش‌نمایش",
    pro: "محاسبه کامل بازتوزیع دارایی",
  },
  {
    name: "پشتیبان‌گیری و خروجی اکسل/CSV",
    free: "محدود",
    pro: "کامل و خودکار",
  },
];

const FAQS = [
  {
    q: "آیا استفاده از پلن رایگان برای همیشه رایگان است؟",
    a: "بله، پلن رایگان سامانه تئا، فاقد محدودیت زمانی است و شما می‌توانید بدون نیاز به وارد کردن هرگونه اطلاعات پرداخت، دارایی‌ها، وام‌ها و بودجه خود را مدیریت کنید.",
  },
  {
    q: "چگونه می‌توانم به نسخه حرفه‌ای (Pro) ارتقا دهم؟",
    a: "در دوره نسخه آزمایشی و پیش‌نمایش فعلی سیستم، کلیه کاربران ثبت‌نامی می‌توانند به صورت رایگان از قابلیت‌های ماژول‌های پیشرفته نظیر مسیر ثروت و هوش مصنوعی بهره‌مند شوند. پس از راه‌اندازی درگاه پرداخت رسمی، امکان فعال‌سازی اشتراک سالیانه و ماهیانه با تخفیف ویژه برای کاربران اولیه فراهم خواهد بود.",
  },
  {
    q: "آیا اطلاعات مالی من امن است؟",
    a: "بله، داده‌های شما با استانداردهای رمزنگاری سرتاسری و به صورت کاملاً ایزوله در پایگاه داده مستقل ذخیره می‌شوند. ما هرگز داده‌های تراکنش‌ها و موجودی حساب‌های شما را به اشخاص ثالث نمی‌فروشیم.",
  },
  {
    q: "آیا امکان لغو اشتراک در هر زمان وجود دارد؟",
    a: "بله، هر زمان که مایل باشید می‌توانید اشتراک خود را لغو کنید و دسترسی به اطلاعات شما حتی در پلن رایگان حفظ خواهد شد.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پلن‌های شفاف، عادلانه و بدون هزینه‌های پنهان</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            سرمایه‌گذاری روی درک و رشد ثروت شخصی
          </h1>
          <p className="text-xs md:text-sm text-[#A0A3AD] leading-relaxed">
            امکانات پایه را رایگان شروع کنید و هر زمان که به شبیه‌سازی‌های عمیق
            آینده و دستیار هوشمند نامحدود نیاز داشتید، به نسخه حرفه‌ای ارتقا
            دهید.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-[14px] bg-[#151619] border border-white/[0.08] mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-[11px] text-xs font-semibold transition-all cursor-pointer",
                billingCycle === "monthly"
                  ? "bg-[#222328] text-[#F0F0F1] shadow"
                  : "text-[#A0A3AD] hover:text-[#F0F0F1]",
              )}
            >
              پرداخت ماهانه
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annually")}
              className={cn(
                "px-4 py-2 rounded-[11px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                billingCycle === "annually"
                  ? "bg-[#F0AE55] text-[#0D0E10] font-bold shadow-[0_0_14px_rgba(240,174,85,0.25)]"
                  : "text-[#A0A3AD] hover:text-[#F0F0F1]",
              )}
            >
              <span>پرداخت سالیانه</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-[#0D0E10] font-extrabold">
                ۲ ماه هدیه
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1: Free Tier */}
          <div className="rounded-[26px] bg-[#141519] border border-white/[0.08] p-8 flex flex-col justify-between space-y-8 relative">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#A0A3AD] uppercase tracking-wider">
                  شروع هوشمند
                </span>
                <h3 className="text-2xl font-black text-[#F0F0F1]">
                  رایگان (Free)
                </h3>
                <p className="text-xs text-[#707581] leading-relaxed">
                  ایده‌آل برای افرادی که می‌خواهند دارایی‌ها، وام‌ها و بودجه
                  ماهانه خود را در یک نگاه شفاف کنند.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-black text-[#F0F0F1]">۰</span>
                <span className="text-xs text-[#A0A3AD]">
                  تومان / برای همیشه
                </span>
              </div>

              {/* Included list */}
              <ul className="space-y-3 pt-4 border-t border-white/[0.06] text-xs">
                {[
                  "داشبورد جامع مدیریت دارایی‌ها (تا ۱۵ مورد)",
                  "ثبت تا ۳ حساب بانکی و کارت اعتباری",
                  "مدیریت وام‌ها و هشدارهای سررسید قسط",
                  "تحلیل جریان نقدینگی و نرخ پس‌انداز ماهانه",
                  "دسترسی به دیده‌بان زنده قیمت طلا و ارز",
                  "۱۰ پرسش ماهانه از دستیار هوشمند مالی",
                  "نمایش تاریخچه مالی ۹۰ روزه",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-[#E8E8E8]"
                  >
                    <Check className="w-4 h-4 text-[#76A98C] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                href="/register?plan=free"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[13px] bg-[#1E2025] hover:bg-[#252830] text-[#F0F0F1] font-bold text-xs border border-white/[0.08] transition-all cursor-pointer"
              >
                <span>ثبت‌نام رایگان</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro Tier (Featured with Amber Ambient Glow) */}
          <div className="rounded-[26px] bg-gradient-to-b from-[#181A20] via-[#151619] to-[#121316] border-2 border-[#F0AE55]/50 p-8 flex flex-col justify-between space-y-8 relative shadow-[0_0_50px_rgba(240,174,85,0.12)]">
            {/* Ambient Badge */}
            <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-[#F0AE55] text-[#0D0E10] text-[11px] font-black shadow-[0_0_14px_rgba(240,174,85,0.4)]">
              پیشنهاد ویژه تئا
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#F0AE55] uppercase tracking-wider">
                  داشبورد مدیریت کامل
                </span>
                <h3 className="text-2xl font-black text-[#F0F0F1]">
                  حرفه‌ای (Pro)
                </h3>
                <p className="text-xs text-[#A0A3AD] leading-relaxed">
                  برای سرمایه‌گذاران، صاحبان کسب‌وکار و افرادی که نیازمند
                  مدل‌سازی چندساله ثروت و تحلیل‌های هوشمند هستند.
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-black text-[#F0AE55] font-mono">
                  {billingCycle === "annually" ? "۱,۸۰۰,۰۰۰" : "۱۸۰,۰۰۰"}
                </span>
                <span className="text-xs text-[#A0A3AD]">
                  تومان / {billingCycle === "annually" ? "سالانه" : "ماهانه"}
                </span>
              </div>

              {/* Included list */}
              <ul className="space-y-3 pt-4 border-t border-white/[0.06] text-xs">
                {[
                  "تمام قابلیت‌های پلن رایگان بدون محدودیت",
                  "ثبت نامحدود دارایی‌ها، حساب‌ها و پورتفولیو",
                  "ماژول کامل مسیر ثروت (Wealth Trajectory) تا ۵ سال",
                  "شبیه‌ساز سناریوهای What-If پیشرفته (تورم، وام، پس‌انداز)",
                  "دستیار هوشمند مالی (AI) نامحدود با تحلیل عمیق پورتفولیو",
                  "محاسبه اختصاصی زمان رهایی از بدهی (Debt-Free Date)",
                  "حالت تعادلی سبد (Ambient Mode) با پیشنهادات بازتوزیع",
                  "پشتیبانی اولویت‌دار و دسترسی زودرس به ابزارهای جدید",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 text-[#F0F0F1]"
                  >
                    <Check className="w-4 h-4 text-[#F0AE55] shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                href={
                  isAuthenticated
                    ? "/dashboard"
                    : `/register?plan=pro&cycle=${billingCycle}`
                }
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] font-black text-xs transition-all shadow-[0_0_24px_rgba(240,174,85,0.35)] cursor-pointer"
              >
                <span>
                  {isAuthenticated
                    ? "فعال در حساب فعلی شما (نسخه پیش‌نمایش)"
                    : "شروع دوره آزمایشی رایگان"}
                </span>
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              </Link>
              <p className="text-[10px] text-center text-[#707581]">
                در دوره پیش‌نمایش، دسترسی حرفه‌ای به صورت رایگان برای کاربران
                اولیه فعال است.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="space-y-6 pt-10 border-t border-white/[0.08]">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#F0F0F1]">
              جدول مقایسه دقیق امکانات
            </h2>
            <p className="text-xs text-[#A0A3AD]">
              بررسی شفاف تفاوت امکانات میان پلن رایگان و حرفه‌ای
            </p>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-white/[0.07] bg-[#141519]">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#1B1D22]">
                  <th className="py-4 px-6 text-[#A0A3AD] font-semibold">
                    امکانات
                  </th>
                  <th className="py-4 px-6 text-[#E8E8E8] font-bold text-center w-1/4">
                    پلن رایگان
                  </th>
                  <th className="py-4 px-6 text-[#F0AE55] font-bold text-center w-1/4">
                    پلن حرفه‌ای (Pro)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {COMPARISON_FEATURES.map((feat, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-6 font-medium text-[#F0F0F1]">
                      {feat.name}
                    </td>
                    <td className="py-3.5 px-6 text-center text-[#A0A3AD]">
                      {feat.free}
                    </td>
                    <td className="py-3.5 px-6 text-center font-semibold text-[#F0AE55]">
                      {feat.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#F0F0F1]">
              پرسش‌های متداول درباره اشتراک و پرداخت
            </h2>
            <p className="text-xs text-[#A0A3AD]">
              پاسخ به سوالات پرتکرار کاربران درباره پلن‌ها و هزینه‌ها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-[18px] bg-[#141519] border border-white/[0.07] p-5 space-y-2.5"
              >
                <h4 className="text-xs font-bold text-[#F0F0F1] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#F0AE55] shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-[#A0A3AD] leading-relaxed pr-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
