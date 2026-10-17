import React from "react";
import Link from "next/link";
import {
  LifeBuoy,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Zap,
} from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>مرکز راهنمایی و پشتیبانی Theia</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            چگونه می‌توانیم به شما کمک کنیم؟
          </h1>
          <p className="text-sm text-[#A0A3AD] max-w-xl mx-auto leading-relaxed">
            راهنماهای گام‌به‌گام، مستندات کاربری و راه‌های تماس با کارشناسان سامانه.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/faq"
            className="rounded-[22px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/30 p-6 space-y-3 transition-all"
          >
            <BookOpen className="w-6 h-6 text-[#F0AE55]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">سوالات پرتکرار (FAQ)</h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              پاسخ به متداول‌ترین پرسش‌های کاربران درباره حساب‌ها، امنیت و شبیه‌سازها.
            </p>
          </Link>

          <Link
            href="/contact"
            className="rounded-[22px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/30 p-6 space-y-3 transition-all"
          >
            <MessageSquare className="w-6 h-6 text-[#76A98C]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">ارسال تیکت و پیام</h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              ارسال پیام مستقیم به پشتیبانی جهت حل مشکلات فنی یا ارتقای اشتراک.
            </p>
          </Link>

          <Link
            href="/insights"
            className="rounded-[22px] bg-[#141519] border border-white/[0.07] hover:border-[#F0AE55]/30 p-6 space-y-3 transition-all"
          >
            <Zap className="w-6 h-6 text-[#88A9BC]" />
            <h3 className="text-sm font-bold text-[#F0F0F1]">بینش و آموزش‌های مالی</h3>
            <p className="text-xs text-[#A0A3AD] leading-relaxed">
              مقاله‌ها و نکات کاربردی پیرامون پورتفولیو، استهلاک وام و سرمایه‌گذاری.
            </p>
          </Link>
        </div>

        <div className="rounded-[24px] bg-[#141519] border border-white/[0.08] p-8 text-center space-y-4">
          <h3 className="text-base font-bold text-[#F0F0F1]">
            نیاز به راهنمایی فوری دارید؟
          </h3>
          <p className="text-xs text-[#A0A3AD] max-w-md mx-auto">
            می‌توانید مستقیماً از طریق پست الکترونیک support@theia-finance.ir با سرپرست تیم فنی در ارتباط باشید.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[12px] bg-[#F0AE55] text-[#0D0E10] text-xs font-bold shadow-[0_0_16px_rgba(240,174,85,0.25)]"
            >
              <span>تماس با ما</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
