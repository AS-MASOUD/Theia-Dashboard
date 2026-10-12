"use client";

import React from "react";
import Link from "next/link";
import { Wallet, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-slate-100">
                Personal FC
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                مشاور مدیریت مالی تئا
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium ml-4">
            <Link href="/about" className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
              درباره ما
            </Link>
            <Link href="/contact" className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
              تماس با ما
            </Link>
            <Link href="/support" className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
              پشتیبانی
            </Link>
            <Link href="/faq" className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
              سوالات متداول
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="gap-2 text-sm h-9">
              <LogIn className="w-4 h-4" />
              ورود
            </Button>
          </Link>
          <Link href="/register">
            <Button className="gap-2 text-sm h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
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
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Personal FC
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              تئا، دستیار هوشمند و سیستم جامع مدیریت یکپارچه دارایی‌ها و وضعیت مالی شخصی شما در شرایط اقتصاد تورمی.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">آشنایی</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">درباره ما</Link></li>
              <li><Link href="/releases" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">تغییرات نسخه و امکانات</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">پشتیبانی و راهنما</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">سوالات متداول (FAQ)</Link></li>
              <li><Link href="/support" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">مرکز پشتیبانی</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">تماس با ما</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">قوانین و امنیت</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">قوانین و مقررات</Link></li>
              <li><Link href="/terms#privacy" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">حریم خصوصی</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Personal FC (Theia). تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4">
            <span>نسخه v0.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
