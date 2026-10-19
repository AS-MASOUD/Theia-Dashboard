import React from "react";
import Link from "next/link";
import {
  Wallet,
  ShieldCheck,
  Target,
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  LineChart,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>درباره پلتفرم Personal FC (Theia)</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            مدیریت ثروت شخصی در شرایط اقتصاد تورمی
          </h1>
          <p className="text-sm md:text-base text-[#A0A3AD] leading-relaxed max-w-2xl mx-auto">
            سامانه تئا با هدف تبدیل سردرگمی‌های مالی روزمره به تصمیم‌گیری‌های
            مستند، شفاف و مبتنی بر داده‌های واقعی متولد شد.
          </p>
        </div>

        {/* Story & Vision */}
        <div className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-8 sm:p-10 space-y-6">
          <h2 className="text-xl font-bold text-[#F0F0F1]">
            داستان ما و چرایی پیدایش تئا
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-[#A0A3AD] leading-loose">
            <p>
              در شرایطی که تورم و نوسان شدید ارزها، محاسبات مالی خانواده‌ها و
              افراد را با چالش‌های بی‌سابقه‌ای مواجه ساخته است، مدیریت سنتی و
              یادداشت‌های پراکنده دیگر پاسخگوی نیازهای یک زندگی مالی هدفمند
              نیست.
            </p>
            <p>
              بسیاری از افراد نمی‌دانند ارزش واقعی سبد دارایی آن‌ها چقدر است، چه
              زمانی وام‌هایشان تسویه می‌شود و اگر ۱۰ درصد پس‌انداز ماهانه خود را
              به طلا تبدیل کنند، ۵ سال دیگر در چه جایگاهی خواهند ایستاد.
            </p>
            <p>
              پلتفرم Theia (Personal Financial Consultant) یک سامانه جامع،
              ایزوله و مستقل است که با بهره‌گیری از محاسبات اعشاری دقیق بانکی،
              نرخ‌های زنده بازار و الگوریتم‌های شبیه‌سازی مسیر ثروت (Wealth
              Trajectory)، به شما اجازه می‌دهد سکان هدایت اقتصاد شخصی‌تان را در
              دست بگیرید.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[20px] bg-[#141519] border border-white/[0.07] p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#76A98C]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">
              امنیت و محرمانگی مطلق
            </h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              ما هیچ‌گاه نیازی به رمزهای دوم یا دسترسی مستقیم بانکی نداریم.
              اطلاعات شما متعلق به خود شماست.
            </p>
          </div>

          <div className="rounded-[20px] bg-[#141519] border border-white/[0.07] p-6 space-y-3">
            <Target className="w-6 h-6 text-[#F0AE55]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">
              واقع‌گرایی بدون توهم
            </h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              سیستم به جای وعده‌های پوچ سودهای میلیاردی، داده‌های قطعی ریاضی و
              شبیه‌سازی‌های منطقی را مبنا قرار می‌دهد.
            </p>
          </div>

          <div className="rounded-[20px] bg-[#141519] border border-white/[0.07] p-6 space-y-3">
            <LineChart className="w-6 h-6 text-[#88A9BC]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">
              سادگی در عین قدرت
            </h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              رابط کاربری مدرن، تیره و الهام‌گرفته از اصول Minimal Dark و
              نورپردازی ملایم Ambient برای تجربه آرامش‌بخش کاربری.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_20px_rgba(240,174,85,0.25)]"
          >
            <span>شروع استفاده از سامانه تئا</span>
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
