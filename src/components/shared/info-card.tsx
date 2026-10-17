"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, description, icon, children, className }: InfoCardProps) {
  return (
    <div className={cn("obsidian-card p-6 transition-all", className)}>
      <div className="flex items-center gap-4 mb-4">
        {icon && (
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
