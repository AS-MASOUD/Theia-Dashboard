"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LogIn,
  UserPlus,
  Menu,
  X,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Layers,
  BookOpen,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const PUBLIC_NAV_LINKS = [
  { name: "صفحه اصلی", href: "/" },
  { name: "دیده‌بان بازارها", href: "/markets" },
  { name: "امکانات سامانه", href: "/features" },
  { name: "بینش و مقالات", href: "/insights" },
  { name: "تعرفه‌ها", href: "/pricing" },
  { name: "درباره ما", href: "/about" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-white/[0.07] bg-[#0D0E10]/85 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-[13px] bg-gradient-to-br from-[#F0AE55] via-[#E29D44] to-[#B37834] flex items-center justify-center shadow-[0_0_18px_rgba(240,174,85,0.28)] text-[#0D0E10] transition-transform group-hover:scale-105">
              <Wallet className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px] tracking-tight text-[#F0F0F1]">
                  Personal FC
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] border border-[#F0AE55]/25">
                  Theia
                </span>
              </div>
              <span className="text-[11px] text-[#A0A3AD] font-normal leading-none mt-0.5">
                مشاور مدیریت مالی و ثروت
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium mr-2">
            {PUBLIC_NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-[10px] transition-all duration-200 relative",
                    isActive
                      ? "text-[#F0AE55] bg-[rgba(240,174,85,0.08)] font-semibold"
                      : "text-[#A0A3AD] hover:text-[#F0F0F1] hover:bg-white/[0.04]"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 right-3 left-3 h-[2px] bg-[#F0AE55] rounded-full shadow-[0_0_8px_#F0AE55]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Authenticated vs Guest */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end text-left pl-1">
                <span className="text-xs font-semibold text-[#F0F0F1] truncate max-w-[140px]">
                  {user?.full_name || "کاربر تئا"}
                </span>
                <span className="text-[10px] text-[#F0AE55] font-medium">
                  {user?.role === "sysmanager"
                    ? "مدیر ارشد سیستم"
                    : user?.role === "admin"
                    ? "مدیر سامانه"
                    : "مرکز فرماندهی"}
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-[13px] bg-gradient-to-r from-[#F0AE55] to-[#E29D44] text-[#0D0E10] text-xs font-bold shadow-[0_0_18px_rgba(240,174,85,0.25)] hover:shadow-[0_0_24px_rgba(240,174,85,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>ورود به داشبورد</span>
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-[13px] text-xs font-medium text-[#A0A3AD] hover:text-[#F0F0F1] hover:bg-white/[0.05] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ورود به حساب</span>
                </button>
              </Link>
              <Link href="/register">
                <button
                  type="button"
                  className="px-4 py-2 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_16px_rgba(240,174,85,0.25)] hover:shadow-[0_0_22px_rgba(240,174,85,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>شروع رایگان</span>
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-[11px] text-[#A0A3AD] hover:text-[#F0F0F1] hover:bg-white/[0.05] transition-colors cursor-pointer"
            aria-label="تغییر وضعیت منو"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#F0AE55]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-[#141519]/98 backdrop-blur-2xl px-5 pt-3 pb-6 animate-in slide-in-from-top-3 duration-200 shadow-2xl">
          <nav className="flex flex-col space-y-1 mb-4">
            {PUBLIC_NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-colors",
                    isActive
                      ? "text-[#F0AE55] bg-[rgba(240,174,85,0.1)] border-r-2 border-[#F0AE55]"
                      : "text-[#A0A3AD] hover:text-[#F0F0F1] hover:bg-white/[0.04]"
                  )}
                >
                  <span>{item.name}</span>
                  <ChevronLeft className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[13px] bg-[#F0AE55] text-[#0D0E10] font-bold text-sm shadow-[0_0_20px_rgba(240,174,85,0.3)]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>ورود به مرکز فرماندهی (داشبورد)</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[13px] bg-[#F0AE55] text-[#0D0E10] font-bold text-sm shadow-[0_0_20px_rgba(240,174,85,0.3)]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ایجاد حساب کاربری رایگان</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[13px] bg-[#1E2025] hover:bg-[#25272E] text-[#F0F0F1] font-medium text-sm border border-white/[0.06]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به سامانه</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#0B0C0E] text-[#E8E8E8] mt-auto relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(240,174,85,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-[13px] bg-gradient-to-br from-[#F0AE55] to-[#B37834] flex items-center justify-center text-[#0D0E10] shadow-[0_0_16px_rgba(240,174,85,0.25)]">
                <Wallet className="h-4.5 w-4.5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-base text-[#F0F0F1]">
                    Personal FC
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F0AE55]/15 text-[#F0AE55] border border-[#F0AE55]/25">
                    Theia
                  </span>
                </div>
                <span className="text-[11px] text-[#A0A3AD]">
                  مرکز فرماندهی هوشمند مدیریت مالی و پورتفولیو
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#A0A3AD] leading-relaxed max-w-md">
              سامانه جامع تئا به شما کمک می‌کند امروز وضعیت واقعی دارایی‌ها، بدهی‌ها، نقدینگی و جریان وجوه نقد خود را بشناسید، گذشته مالی‌تان را تحلیل کنید و با شبیه‌سازی و هوش مصنوعی، تصمیم‌های آینده را با آگاهی کامل اتخاذ نمایید.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151619] border border-white/[0.08] text-[11px] text-[#76A98C]">
                <span className="w-2 h-2 rounded-full bg-[#76A98C] animate-pulse" />
                <span>پایش زنده نرخ‌های طلا، ارز و کریپتو فعال است</span>
              </div>
            </div>
          </div>

          {/* Column 1: امکانات */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#F0F0F1] mb-4">
              امکانات کلیدی
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/features#portfolio" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors flex items-center gap-1.5">
                  <span>سبد دارایی‌ها (پورتفولیو)</span>
                </Link>
              </li>
              <li>
                <Link href="/features#trajectory" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors flex items-center gap-1.5">
                  <span>مسیر ثروت (Trajectory)</span>
                </Link>
              </li>
              <li>
                <Link href="/features#liabilities" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors flex items-center gap-1.5">
                  <span>مدیریت وام‌ها و استهلاک</span>
                </Link>
              </li>
              <li>
                <Link href="/features#scenarios" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors flex items-center gap-1.5">
                  <span>شبیه‌ساز تصمیمات مالی</span>
                </Link>
              </li>
              <li>
                <Link href="/features#ai" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors flex items-center gap-1.5">
                  <span>دستیار هوشمند مالی (AI)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: بازارها و مقالات */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#F0F0F1] mb-4">
              بازارها و بینش مالی
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/markets" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  دیده‌بان جامع طلا و مسکوکات
                </Link>
              </li>
              <li>
                <Link href="/markets?cat=currency" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  نرخ مبادله‌ای و آزاد ارزها
                </Link>
              </li>
              <li>
                <Link href="/markets?cat=crypto" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  بازار رمزارزهای پایه
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  مجموعه مقالات سواد مالی
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  طرح‌ها و تعرفه‌های استفاده
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: شفافیت و پشتیبانی */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#F0F0F1] mb-4">
              امنیت و دسترسی
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  درباره سامانه تئا
                </Link>
              </li>
              <li>
                <Link href="/terms#security" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  اصول حریم خصوصی و امنیت داده
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  پرسش‌های متداول (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  مرکز راهنمایی و تماس
                </Link>
              </li>
              <li>
                <Link href="/releases" className="text-[#A0A3AD] hover:text-[#F0AE55] transition-colors">
                  یادداشت انتشار نسخه v0.1.0
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#707581]">
          <p>
            © {new Date().getFullYear()} Theia Personal Finance Consultant (Personal FC). تمامی حقوق محفوظ است.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a
              href="/?view=mobile"
              className="px-2.5 py-1 rounded-[8px] bg-[#141519] border border-white/[0.08] hover:border-[#F0AE55]/40 text-[#F0AE55] font-semibold transition-all flex items-center gap-1.5"
              title="تغییر به نسخه موبایل اپلیکیشن"
            >
              <span>مشاهده نسخه موبایل (PWA)</span>
            </a>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0AE55]" />
              معماری امن و داده‌های رمزنگاری شده
            </span>
            <span className="text-white/10">•</span>
            <span>طراحی بر مبنای اصول Minimal Dark & Ambient Illumination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
