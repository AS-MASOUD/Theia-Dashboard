"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { QuickTransactionModal } from "../financial/quick-transaction-modal";
import { PublicHeader, PublicFooter } from "./public-shell";

const AUTH_ONLY_ROUTES = ["/login", "/register"];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/markets")) return true;
  if (pathname.startsWith("/features")) return true;
  if (pathname.startsWith("/insights")) return true;
  if (pathname.startsWith("/pricing")) return true;
  const staticPublic = ["/contact", "/about", "/faq", "/support", "/releases", "/terms"];
  return staticPublic.includes(pathname);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthOnly = AUTH_ONLY_ROUTES.includes(pathname);
  const isPublic = isPublicRoute(pathname);
  const isProtected = !isAuthOnly && !isPublic;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && isProtected) {
        const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${redirectParam}`);
      } else if (isAuthenticated && isAuthOnly) {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, isProtected, isAuthOnly, pathname, router]);

  // If on login or register page
  if (isAuthOnly) {
    if (isAuthenticated) {
      return null;
    }
    return (
      <div className="min-h-screen bg-[#0D0E10] text-[#E8E8E8] flex items-center justify-center">
        {children}
      </div>
    );
  }

  // Public routes (accessible to everyone: guests and logged in users)
  if (isPublic) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0D0E10] text-[#F0F0F1] selection:bg-[#F0AE55]/20 selection:text-[#F0AE55]">
        <PublicHeader />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PublicFooter />
      </div>
    );
  }

  // If still checking authentication status for protected routes
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0E10] text-[#9A9DA5]">
        <div className="w-9 h-9 border-2 border-[rgba(240,174,85,0.2)] border-t-[#F0AE55] rounded-full animate-spin mb-4" />
        <p className="text-xs font-normal">در حال بررسی هویت امنیتی...</p>
      </div>
    );
  }

  // If unauthenticated on a protected page, block rendering while redirecting
  if (!isAuthenticated && isProtected) {
    return null;
  }

  // Authenticated user on protected app route: render full dashboard command center
  return (
    <div className="flex min-h-screen bg-[#0D0E10] text-[#E8E8E8] relative overflow-x-hidden selection:bg-[#F0AE55]/20 selection:text-[#F0AE55]">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="مشاور مدیریت مالی تئا"
          subtitle="مرکز فرماندهی هوشمند دارایی‌ها، نسبت‌ها و پایش سبد سرمایه‌گذاری"
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
