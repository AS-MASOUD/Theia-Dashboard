"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import {
  Moon,
  Sun,
  Plus,
  RefreshCw,
  ArrowLeftRight,
  LogIn,
  Bell,
  CheckCheck,
  TrendingUp,
  Award,
  Info,
  LogOut,
  UserCircle,
  Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/components/currency-provider";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenQuickTx?: () => void;
}

const emptySubscribe = () => () => {};

export function Header({
  title = "نمای کلی",
  subtitle,
  onOpenQuickTx,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { currency, toggleCurrency } = useCurrency();
  const { user, isAuthenticated, logout, isSysManager, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Notifications Query
  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications({ limit: 15 }),
    refetchInterval: 60000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const checkTriggersMutation = useMutation({
    mutationFn: () => api.checkMarketTriggers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const unreadCount = notifData?.unread_count || 0;
  const notificationsList = notifData?.items || [];

  return (
    <header className="h-16 border-b border-[#282A2F] bg-[#101114]/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-[#E8E8E8] flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#9A9DA5] font-normal">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Currency Switcher (Toman / Dollar) */}
        <button
          onClick={toggleCurrency}
          title="تغییر واحد پول (تومان / دلار)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border border-[#282A2F] hover:border-[#32343A] bg-[#1B1D21] text-xs font-medium text-[#E8E8E8] transition-colors"
        >
          <ArrowLeftRight className="h-3 w-3 text-[#F0AE55]" />
          <span>نمایش: {currency === "TOMAN" ? "تومان" : "دلار ($)"}</span>
        </button>

        {/* Refresh Financial Data */}
        <button
          onClick={handleRefresh}
          title="به‌روزرسانی داده‌های مالی"
          className="p-2 rounded-[12px] text-[#9A9DA5] hover:text-[#E8E8E8] hover:bg-[#1B1D21] transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#F0AE55]" : ""}`}
          />
        </button>

        {/* Notification Center Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsUserMenuOpen(false);
            }}
            title="اعلان‌ها و هشدارهای بازار"
            className="p-2 rounded-[12px] relative text-[#9A9DA5] hover:text-[#E8E8E8] hover:bg-[#1B1D21] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#C77A82] text-white text-[10px] font-medium flex items-center justify-center font-mono">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotificationOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#141518] border border-[#282A2F] rounded-[22px] shadow-xl p-3 z-40 space-y-2 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#282A2F]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#E8E8E8]">
                      اعلان‌ها و هشدارهای بازار
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#C77A82]/15 text-[#C77A82] font-mono border border-[#C77A82]/25">
                        {unreadCount} جدید
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => checkTriggersMutation.mutate()}
                      disabled={checkTriggersMutation.isPending}
                      title="بررسی نوسان بازار و اهداف"
                      className="p-1 rounded text-[#9A9DA5] hover:text-[#F0AE55] transition-colors"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          checkTriggersMutation.isPending
                            ? "animate-spin text-[#F0AE55]"
                            : ""
                        }`}
                      />
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        title="خواندن همه"
                        className="flex items-center gap-1 px-1.5 py-1 text-[10px] text-[#9A9DA5] hover:text-[#F0AE55]"
                      >
                        <CheckCheck className="h-3 w-3" />
                        <span>خواندن همه</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto space-y-1.5 divide-y divide-[#282A2F]/50">
                  {notificationsList.length === 0 ? (
                    <div className="p-6 text-center text-[#9A9DA5] text-xs">
                      اعلان جدیدی وجود ندارد.
                    </div>
                  ) : (
                    notificationsList.map((notif) => {
                      const isVolatility =
                        notif.notification_type === "ASSET_VOLATILITY";
                      const isGoal = notif.notification_type === "GOAL_REACHED";

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.is_read) {
                              markReadMutation.mutate(notif.id);
                            }
                          }}
                          className={`pt-2 p-2 rounded-[14px] transition-colors cursor-pointer ${
                            !notif.is_read
                              ? "bg-[rgba(240,174,85,0.06)] border border-[rgba(240,174,85,0.18)] hover:bg-[rgba(240,174,85,0.10)]"
                              : "hover:bg-[#1B1D21] opacity-75"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {isVolatility ? (
                                <div className="h-6 w-6 rounded-lg bg-[rgba(240,174,85,0.12)] text-[#F0AE55] flex items-center justify-center">
                                  <TrendingUp className="h-3.5 w-3.5" />
                                </div>
                              ) : isGoal ? (
                                <div className="h-6 w-6 rounded-lg bg-[#76A98C]/15 text-[#76A98C] flex items-center justify-center">
                                  <Award className="h-3.5 w-3.5" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-lg bg-[#1B1D21] text-[#9A9DA5] flex items-center justify-center">
                                  <Info className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-[#E8E8E8] text-xs">
                                  {notif.title}
                                </span>
                                {!notif.is_read && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0AE55] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#9A9DA5] leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-[#696D77] pt-0.5">
                                <span>
                                  {new Date(
                                    notif.created_at,
                                  ).toLocaleTimeString("fa-IR")}
                                </span>
                                {isVolatility && (
                                  <span className="text-[#F0AE55] font-medium">
                                    توصیه: تحلیل و بازتنظیم سبد
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="تغییر حالت تیره / روشن"
          className="p-2 rounded-[12px] text-[#9A9DA5] hover:text-[#E8E8E8] hover:bg-[#1B1D21] transition-colors w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4 text-[#F0AE55]" />
            ) : (
              <Moon className="h-4 w-4 text-[#E8E8E8]" />
            )
          ) : (
            <span className="h-4 w-4 block" />
          )}
        </button>

        {/* New Transaction Button */}
        {onOpenQuickTx && (
          <button
            onClick={onOpenQuickTx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>ثبت تراکنش/دارایی جدید</span>
          </button>
        )}

        {/* User Identity / Authentication Component */}
        <div className="relative mr-1">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-[12px] border border-[#282A2F] hover:border-[#32343A] bg-[#141518] hover:bg-[#1B1D21] transition-colors text-xs text-[#E8E8E8]"
              >
                <div className="h-7 w-7 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] font-medium flex items-center justify-center text-xs">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-medium text-[#E8E8E8] leading-tight">
                    {user.full_name}
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 text-[#9A9DA5] transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-[#141518] border border-[#282A2F] rounded-[18px] shadow-xl p-2 z-40 space-y-1 text-xs">
                    {/* User Mini Header */}
                    <div className="p-2 border-b border-[#282A2F] space-y-0.5">
                      <p className="font-semibold text-[#E8E8E8] truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-[#9A9DA5] truncate font-mono" dir="ltr">
                        {user.email || user.phone_number || "حساب کاربری فعال"}
                      </p>
                    </div>

                    {/* Navigation Items */}
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#9A9DA5] hover:bg-[#1B1D21] hover:text-[#F0AE55] transition-colors"
                    >
                      <UserCircle className="h-4 w-4 text-[#F0AE55] shrink-0" />
                      <span>پروفایل کاربری</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#9A9DA5] hover:bg-[#1B1D21] hover:text-[#F0AE55] transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4 text-[#696D77] shrink-0" />
                      <span>تنظیمات سامانه</span>
                    </Link>

                    <div className="my-1 border-t border-[#282A2F]" />

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#C77A82] hover:bg-[#C77A82]/10 transition-colors text-right cursor-pointer font-medium"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>خروج از حساب کاربری</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] border border-[#282A2F] hover:border-[#F0AE55]/40 bg-[#1B1D21] text-[#F0AE55] text-xs font-medium transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>ورود / ثبت‌نام</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
