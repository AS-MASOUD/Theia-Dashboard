"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Clock } from "lucide-react";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  className?: string;
}

function getIcon(status: StatusType, showIcon: boolean) {
  if (!showIcon) return null;
  
  switch (status) {
    case "success": return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
    case "warning": return <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />;
    case "error": return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
    case "info": return <Clock className="w-3.5 h-3.5 mr-1.5" />;
    default: return null;
  }
}

export function StatusBadge({ status, label, showIcon = true, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "error":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "info":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      getStatusStyles(),
      className
    )}>
      {getIcon(status, showIcon)}
      {label}
    </span>
  );
}

