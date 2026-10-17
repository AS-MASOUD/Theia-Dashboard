"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string | number;
  changePeriod?: string;
  isCurrency?: boolean;
  currency?: string;
  icon?: LucideIcon;
  variant?: "default" | "positive" | "negative" | "warning";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changePeriod = "نسبت به ماه گذشته",
  isCurrency = true,
  currency = "TOMAN",
  icon: Icon,
  variant = "default",
  className,
}: MetricCardProps) {
  const { formatMoney } = useCurrency();
  const displayVal = isCurrency ? formatMoney(value, currency) : value;

  const numChange = typeof change === "string" ? parseFloat(change) : change;
  const hasChange = numChange !== undefined && !isNaN(numChange);
  const isPositiveChange = hasChange && numChange > 0;
  const isNegativeChange = hasChange && numChange < 0;

  const variantAccent = {
    default: {
      dot: "bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.7)]",
      iconBg: "bg-[rgba(240,174,85,0.08)] border-[rgba(240,174,85,0.22)] text-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.15)]",
      badgeText: "فعال",
    },
    positive: {
      dot: "bg-[#76A98C] shadow-[0_0_6px_rgba(118,169,140,0.8)]",
      iconBg: "bg-[rgba(118,169,140,0.08)] border-[rgba(118,169,140,0.22)] text-[#76A98C] shadow-[0_0_12px_rgba(118,169,140,0.15)]",
      badgeText: "مطلوب",
    },
    negative: {
      dot: "bg-[#C77A82] shadow-[0_0_6px_rgba(199,122,130,0.8)]",
      iconBg: "bg-[rgba(199,122,130,0.08)] border-[rgba(199,122,130,0.22)] text-[#C77A82] shadow-[0_0_12px_rgba(199,122,130,0.15)]",
      badgeText: "توجه",
    },
    warning: {
      dot: "bg-[#F0AE55] shadow-[0_0_6px_rgba(240,174,85,0.7)]",
      iconBg: "bg-[rgba(240,174,85,0.08)] border-[rgba(240,174,85,0.22)] text-[#F0AE55] shadow-[0_0_12px_rgba(240,174,85,0.15)]",
      badgeText: "جاری",
    },
  }[variant];

  return (
    <div
      className={cn(
        "obsidian-card p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-200",
        className
      )}
    >
      {/* Card Header: Icon & Title & Status Pill */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-[14px] border flex items-center justify-center transition-colors",
                variantAccent.iconBg
              )}
            >
              <Icon className="h-4 w-4 stroke-[1.8]" />
            </div>
          )}
          <span className="text-xs font-normal text-[#9A9DA5]">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B1D21] border border-[#282A2F]">
          <span className={cn("w-1.5 h-1.5 rounded-full", variantAccent.dot)} />
          <span className="text-[10px] font-medium text-[#9A9DA5]">
            {variantAccent.badgeText}
          </span>
        </div>
      </div>

      {/* Metric Value */}
      <div className="mt-4 relative z-10">
        <div className="text-2xl font-normal tracking-tight text-[#E8E8E8] font-number" dir="ltr">
          {displayVal}
        </div>

        {(hasChange || subtitle) && (
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            {hasChange && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-[11px] font-number",
                  isPositiveChange &&
                    "text-[#76A98C] bg-[#76A98C]/12 border border-[#76A98C]/25",
                  isNegativeChange &&
                    "text-[#C77A82] bg-[#C77A82]/12 border border-[#C77A82]/25",
                  numChange === 0 &&
                    "text-[#9A9DA5] bg-[#1B1D21] border border-[#282A2F]"
                )}
              >
                {isPositiveChange && <TrendingUp className="h-3 w-3" />}
                {isNegativeChange && <TrendingDown className="h-3 w-3" />}
                {numChange > 0 ? `+${numChange.toFixed(1)}%` : `${numChange.toFixed(1)}%`}
              </span>
            )}
            <span className="text-[#9A9DA5] text-[11px]">
              {subtitle || changePeriod}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
