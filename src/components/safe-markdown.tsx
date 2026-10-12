"use client";

import React from "react";

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Escapes raw HTML special characters to prevent HTML/XSS injection.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates link and image URLs against a strict protocol whitelist.
 * Strictly blocks dangerous schemes such as javascript:, vbscript:, data:, file:, etc.
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:")
  );
}

/**
 * SafeMarkdown parses markdown syntax strictly escaping raw HTML
 * and enforcing safe protocol checks on all hyperlinks.
 */
export function SafeMarkdown({ content, className = "" }: SafeMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, lineIndex) => {
        const isBullet = line.startsWith("- ") || line.startsWith("* ");
        const textToParse = isBullet ? line.slice(2) : line;
        const rendered = renderInline(textToParse);

        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start gap-1.5 pr-2">
              <span className="text-indigo-400 select-none">•</span>
              <span className="flex-1">{rendered}</span>
            </div>
          );
        }

        return (
          <div key={lineIndex} className="min-h-[1.25rem]">
            {rendered}
          </div>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 font-mono text-[11px] text-pink-600 dark:text-pink-400"
        >
          {code}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      if (isSafeUrl(url)) {
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:text-sky-600 underline font-medium"
          >
            {label}
          </a>
        );
      } else {
        return <span key={i}>{label}</span>;
      }
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
