"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { AttentionItem } from "@/types/financial";
import { cn } from "@/lib/utils";

interface AttentionBannerProps {
  items: AttentionItem[];
}

export function AttentionBanner({ items }: AttentionBannerProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        <span>رادار هشدارهای مالی نیازمند توجه</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const isCritical = item.severity === "critical";
          const isWarning = item.severity === "warning";

          return (
            <div
              key={item.id}
              className={cn(
                "p-3.5 rounded-2xl border flex flex-col justify-between text-xs transition-all bg-[#0c0e14]",
                isCritical &&
                  "border-rose-500/30 text-rose-300",
                isWarning &&
                  "border-amber-500/30 text-amber-300",
                !isCritical &&
                  !isWarning &&
                  "border-white/10 text-slate-200"
              )}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                  {isCritical && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                  {isWarning && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                  {!isCritical && !isWarning && <Info className="h-4 w-4 text-cyan-400 shrink-0" />}
                  <span>{item.title}</span>
                </div>
                <p className="mt-1 text-slate-400 leading-relaxed text-[11px]">
                  {item.message}
                </p>
              </div>

              {item.action_link && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
                  <Link
                    href={item.action_link}
                    className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <span>مشاهده جزئیات</span>
                    <ArrowLeft className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
