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
    <div className="obsidian-card p-6 md:p-8 mb-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
