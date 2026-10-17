"use client";

import React from "react";
import Link from "next/link";
import { Wallet, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-white/10 bg-[#07080b]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] tracking-tight text-slate-100">
                Personal FC
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                مشاور مدیریت مالی تئا
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium ml-4">
            <Link href="/about" className="px-3 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
              درباره ما
            </Link>
            <Link href="/contact" className="px-3 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
              تماس با ما
            </Link>
            <Link href="/support" className="px-3 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
              پشتیبانی
            </Link>
            <Link href="/faq" className="px-3 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
              سوالات متداول
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="gap-2 text-sm h-9">
              <LogIn className="w-4 h-4" />
              ورود
            </Button>
          </Link>
          <Link href="/register">
            <Button className="gap-2 text-sm h-9 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25">
              <UserPlus className="w-4 h-4" />
              ثبت‌نام رایگان
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07080b] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-100">
                Personal FC
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              تئا، دستیار هوشمند و سیستم جامع مدیریت یکپارچه دارایی‌ها و وضعیت مالی شخصی شما در شرایط اقتصاد تورمی.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-100 mb-4">آشنایی</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-400 hover:text-amber-400 transition-colors">درباره ما</Link></li>
              <li><Link href="/releases" className="text-slate-400 hover:text-amber-400 transition-colors">تغییرات نسخه و امکانات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">پشتیبانی و راهنما</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-slate-400 hover:text-amber-400 transition-colors">سوالات متداول (FAQ)</Link></li>
              <li><Link href="/support" className="text-slate-400 hover:text-amber-400 transition-colors">مرکز پشتیبانی</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-100 mb-4">قوانین و امنیت</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors">قوانین و مقررات</Link></li>
              <li><Link href="/terms#privacy" className="text-slate-400 hover:text-amber-400 transition-colors">حریم خصوصی</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Personal FC (Theia). تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4">
            <span>نسخه v0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
