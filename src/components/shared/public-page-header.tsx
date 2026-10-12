"use client";

import React from "react";
import { Breadcrumbs } from "./breadcrumbs";

interface PublicPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs: { label: string; href: string }[];
}

export function PublicPageHeader({ title, description, icon, breadcrumbs }: PublicPageHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
