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
    <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-all hover:shadow-md", className)}>
      <div className="flex items-center gap-4 mb-4">
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
