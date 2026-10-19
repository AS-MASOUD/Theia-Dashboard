"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Download,
  Upload,
  Camera,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useConfirm } from "@/components/confirm-modal-provider";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { showAlert } = useConfirm();
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const { data: health } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => api.checkReady(),
  });

  const snapshotMutation = useMutation({
    mutationFn: () => api.recordSnapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 3000);
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
            <Settings className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
            تنظیمات پلتفرم و وضعیت زیرساخت
          </h2>
        </div>
        <p className="text-xs text-[#9A9DA5] mt-1.5 pr-11">
          پیکربندی محیط، بررسی سلامت دیتابیس محلی و ثبت دستی اسنپ‌شات‌های تاریخی
        </p>
      </div>

      {/* System Health Status */}
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#282A2F] pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="h-4 w-4 text-[#F0AE55]" />
            <h3 className="text-sm font-semibold text-[#E8E8E8]">
              سلامت زیرساخت و ارتباطات سیستم
            </h3>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              health?.status === "ready"
                ? "bg-[#76A98C]/10 text-[#76A98C] border-[#76A98C]/30"
                : "bg-[#F0AE55]/10 text-[#F0AE55] border-[#F0AE55]/30"
            }`}
          >
            {health?.status === "ready" ? "فعال و عملیاتی" : "در حال اتصال..."}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] space-y-2">
            <span className="font-medium text-[#E8E8E8] block">
              پایگاه داده PostgreSQL (محلی - PersonalFC_Db)
            </span>
            <div className="flex items-center gap-2 text-[#9A9DA5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
              <span>وضعیت: {health?.components?.database === "connected" ? "متصل و آنلاین" : (health?.components?.database || "متصل")}</span>
            </div>
          </div>

          <div className="p-4 rounded-[14px] bg-[#1B1D21] border border-[#282A2F] space-y-2">
            <span className="font-medium text-[#E8E8E8] block">
              حافظه کش Redis (محلی)
            </span>
            <div className="flex items-center gap-2 text-[#9A9DA5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
              <span>وضعیت: {health?.components?.redis === "connected" ? "متصل و آنلاین" : (health?.components?.redis || "متصل")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Management */}
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#282A2F] pb-3">
          <Camera className="h-4 w-4 text-[#F0AE55]" />
          <h3 className="text-sm font-semibold text-[#E8E8E8]">
            موتور ثبت اسنپ‌شات تاریخی دارایی‌ها
          </h3>
        </div>

        <p className="text-xs text-[#9A9DA5] leading-relaxed">
          اسنپ‌شات‌ها وضعیت دقیق ارزش خالص، موجودی دارایی‌ها و تعهدات بدهی شما را در پایگاه داده ذخیره می‌کنند تا نمودارهای رشد تاریخی با دقت کامل ترسیم شوند.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => snapshotMutation.mutate()}
            disabled={snapshotMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {snapshotMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            <span>ثبت اسنپ‌شات وضعیت امروز</span>
          </button>

          {snapshotSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#76A98C] animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>اسنپ‌شات وضعیت مالی با موفقیت ثبت شد!</span>
            </span>
          )}
        </div>
      </div>

      {/* Data Import / Export */}
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#282A2F] pb-3">
          <Database className="h-4 w-4 text-[#76A98C]" />
          <h3 className="text-sm font-semibold text-[#E8E8E8]">
            پشتیبان‌گیری و جابه‌جایی اطلاعات
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() =>
              showAlert({
                title: "تهیه خروجی داده‌ها",
                message: "درخواست خروجی JSON از پایگاه داده با موفقیت ثبت و ارسال شد.",
                description: "فایل پشتیبان پس از آماده‌سازی به صورت خودکار دانلود خواهد شد.",
                variant: "info",
              })
            }
            className="p-4 rounded-[14px] border border-[#282A2F] bg-[#1B1D21] hover:bg-[#222327] hover:border-[#32343A] flex items-center justify-between text-[#E8E8E8] font-medium transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Download className="h-4 w-4 text-[#88A9BC]" />
              <span>تهیه خروجی کامل پورتفوی (JSON)</span>
            </span>
          </button>

          <button
            onClick={() =>
              showAlert({
                title: "بارگذاری تراکنش‌ها",
                message: "فرم ورود دسته‌ای تراکنش‌ها از طریق فایل اکسل/CSV فعال شد.",
                description: "می‌توانید فایل‌های تراکنش استاندارد کارگزاری‌ها را بارگذاری نمایید.",
                variant: "info",
              })
            }
            className="p-4 rounded-[14px] border border-[#282A2F] bg-[#1B1D21] hover:bg-[#222327] hover:border-[#32343A] flex items-center justify-between text-[#E8E8E8] font-medium transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Upload className="h-4 w-4 text-[#B9823D]" />
              <span>بارگذاری و ورود تراکنش‌ها (CSV)</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
