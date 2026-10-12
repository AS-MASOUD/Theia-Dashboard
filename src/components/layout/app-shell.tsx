"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { QuickTransactionModal } from "../financial/quick-transaction-modal";
import { PublicHeader, PublicFooter } from "./public-shell";

const AUTH_ONLY_ROUTES = ["/login", "/register"];
const INFO_ROUTES = ["/contact", "/about", "/faq", "/support", "/releases", "/terms"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.includes(pathname);
  const isInfoRoute = INFO_ROUTES.includes(pathname);
  const isProtectedRoute = !isAuthOnlyRoute && !isInfoRoute;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && isProtectedRoute) {
        router.replace("/login");
      } else if (isAuthenticated && isAuthOnlyRoute) {
        router.replace("/");
      }
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, isAuthOnlyRoute, router]);

  // If on login or register page
  if (isAuthOnlyRoute) {
    if (isAuthenticated) {
      return null;
    }
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex items-center justify-center">
        {children}
      </div>
    );
  }

  // If still checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070b14] text-slate-600 dark:text-slate-300">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">در حال بررسی هویت...</p>
      </div>
    );
  }

  // If unauthenticated on a protected page, block rendering while redirecting
  if (!isAuthenticated && isProtectedRoute) {
    return null;
  }

  // If unauthenticated on an info route, show public shell
  if (!isAuthenticated && isInfoRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100">
        <PublicHeader />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Authenticated user: render full dashboard shell
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="مشاور مدیریت مالی تئا"
          subtitle="بررسی وضعیت مالی، عملکرد مدیریت و شاخص پیشرفت"
          onOpenQuickTx={() => setIsQuickTxOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
      />
    </div>
  );
}
