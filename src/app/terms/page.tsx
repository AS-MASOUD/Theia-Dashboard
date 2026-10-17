import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>قوانین، مقررات و حریم خصوصی</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            اصول شفافیت و حریم خصوصی داده‌ها
          </h1>
          <p className="text-sm text-[#A0A3AD] max-w-xl mx-auto leading-relaxed">
            تعهدات متقابل سامانه تئا و کاربران در زمینه امانتداری اطلاعات و امنیت دارایی‌ها.
          </p>
        </div>

        {/* Privacy Section */}
        <div id="privacy" className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-bold text-[#F0F0F1]">
            <Lock className="w-5 h-5 text-[#F0AE55]" />
            <h2>سیاست حفظ حریم خصوصی (Privacy Policy)</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#A0A3AD] leading-loose">
            <p>
              ۱. <strong>عدم دسترسی به داده‌های بانکی:</strong> سامانه تئا به هیچ عنوان اطلاعات محرمانه بانکی، رمزهای عبور یا شماره کارت‌های شما را دریافت نمی‌کند. مبالغ وارد شده صرفاً اعداد آماری هستند که توسط شخص شما ثبت می‌شوند.
            </p>
            <p>
              ۲. <strong>رمزنگاری و ایزولاسیون:</strong> تمامی نشست‌ها (Sessions) و توکن‌های احراز هویت با استانداردهای امنیتی قوی رمزنگاری شده و به صورت ایزوله در پایگاه داده مستقل ذخیره می‌شوند.
            </p>
            <p>
              ۳. <strong>عدم واگذاری داده‌ها:</strong> اطلاعات مالی کاربران به هیچ عنوان به شرکت‌های تبلیغاتی، بازاریابی یا اشخاص ثالث فروخته نخواهد شد.
            </p>
          </div>
        </div>

        {/* Terms Section */}
        <div className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-bold text-[#F0F0F1]">
            <FileText className="w-5 h-5 text-[#76A98C]" />
            <h2>شرایط و ضوابط استفاده (Terms of Service)</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#A0A3AD] leading-loose">
            <p>
              ۱. <strong>ماهیت تحلیلی سامانه:</strong> پلتفرم Personal FC یک ابزار نرم‌افزاری حسابداری شخصی و شبیه‌سازی آماری است. هیچ‌یک از خروجی‌های محاسباتی، چارت‌های مسیر ثروت یا پاسخ‌های دستیار هوشمند، به منزله پیشنهاد قطعی سرمایه‌گذاری یا تضمین سود در بازارهای مالی نیست.
            </p>
            <p>
              ۲. <strong>مسئولیت تصمیم‌گیری:</strong> تصمیم‌های مربوط به خرید، فروش یا استقراض در بازارهای واقعی بر عهده شخص کاربر است.
            </p>
            <p>
              ۳. <strong>حق استفاده و نگهداری:</strong> کاربر حق دارد در هر زمان نسبت به دریافت خروجی کامل داده‌ها یا حذف حساب کاربری خود اقدام نماید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
