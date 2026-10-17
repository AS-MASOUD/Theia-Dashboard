"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  Coins,
  ArrowLeftRight,
  ShieldAlert,
  ArrowDownUp,
  Target,
  LineChart,
  SlidersHorizontal,
  Bot,
  Settings,
  Sparkles,
  Wallet,
  ShieldCheck,
  UserCircle,
  Layers,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const navigationItems = [
  { name: "نمای کلی", href: "/", icon: LayoutDashboard },
  { name: "سبد دارایی (پورتفولیو)", href: "/portfolio", icon: PieChart },
  { name: "مسیر ثروت (Trajectory)", href: "/wealth-trajectory", icon: Layers },
  { name: "دفتر کل تراکنش‌ها", href: "/transactions", icon: ArrowLeftRight },
  { name: "بدهی‌ها و تسهیلات", href: "/liabilities", icon: ShieldAlert },
  { name: "جریان نقدینگی و بودجه", href: "/cashflow", icon: ArrowDownUp },
  { name: "اهداف مالی", href: "/goals", icon: Target },
  { name: "تحلیل و نسبت‌های مالی", href: "/analytics", icon: LineChart },
  { name: "شبیه‌ساز سناریوها", href: "/scenarios", icon: SlidersHorizontal },
  { name: "دستیار هوشمند مالی", href: "/ai", icon: Bot, highlight: true },
  { name: "فهرست دارایی‌ها", href: "/assets", icon: Coins },
  {
    name: "مدیریت کاربران و نقش‌ها",
    href: "/users",
    icon: ShieldCheck,
    sysManagerOnly: true,
  },
  { name: "پروفایل کاربری", href: "/profile", icon: UserCircle },
  { name: "تنظیمات سیستم", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSysManager, logout, isAuthenticated } = useAuth();

  return (
    <aside className="w-64 border-l border-[#282A2F] bg-[#101114] flex flex-col shrink-0 sticky top-0 h-screen z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-[#282A2F] shrink-0">
        <div className="h-9 w-9 rounded-[14px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#F0AE55]">
          <Wallet className="h-4.5 w-4.5 stroke-[2]" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-[#E8E8E8]">
            مدیریت مالی تئا
          </span>
          <span className="text-[10px] text-[#F0AE55] font-medium tracking-wide">
            Theia Personal FC
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navigationItems.map((item) => {
          // Gate sysManager-only items strictly to sysmanager
          if (item.sysManagerOnly && !isSysManager) {
            return null;
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-medium transition-all group relative",
                isActive
                  ? "bg-[rgba(240,174,85,0.08)] text-[#F0AE55] border-r-2 border-[#F0AE55] shadow-[0_0_14px_rgba(240,174,85,0.12)]"
                  : "text-[#9A9DA5] hover:text-[#E8E8E8] hover:bg-[#141518]",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-[#F0AE55] stroke-[2] drop-shadow-[0_0_6px_rgba(240,174,85,0.4)]"
                    : "text-[#696D77] group-hover:text-[#9A9DA5] stroke-[1.8]",
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.highlight && (
                <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-[rgba(240,174,85,0.09)] text-[#F0AE55] border border-[rgba(240,174,85,0.22)] shadow-[0_0_8px_rgba(240,174,85,0.15)] flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </span>
              )}
              {item.sysManagerOnly && isSysManager && (
                <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#1B1D21] text-[#9A9DA5] border border-[#282A2F]">
                  مدیر ارشد
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Sync Status & Logout */}
      <div className="p-3.5 border-t border-[#282A2F] shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#9A9DA5]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]" />
            <span className="text-[11px] text-[#9A9DA5]">پایگاه‌داده متصل است</span>
          </div>
          <span className="font-mono text-[10px] text-[#696D77]">
            v0.1.0
          </span>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-xs text-[#C77A82] hover:text-[#E8E8E8] hover:bg-[#141518] transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>خروج از سامانه</span>
          </button>
        )}
      </div>
    </aside>
  );
}
