"use client";

import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export type AuthTransitionState =
  | "idle"
  | "authenticating"
  | "success"
  | "exiting"
  | "error";

interface GlassAuthCardProps {
  children: React.ReactNode;
  transitionState?: AuthTransitionState;
  statusText?: string;
  onCancelSubmitting?: () => void;
  className?: string;
}

export function GlassAuthCard({
  children,
  transitionState = "idle",
  statusText,
  onCancelSubmitting,
  className,
}: GlassAuthCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 520 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) =>
        setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setDimensions({ width: offsetWidth, height: offsetHeight });
        }
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const { width, height } = dimensions;

  // Geometry: Card chamfer sized to harmoniously frame the enlarged corner decorations
  const chamfer = Math.min(74, Math.max(70, Math.floor(width * 0.175)));
  const radius = Math.min(24, Math.max(18, Math.floor(width * 0.055)));

  // SVG Path for the outer glass card (Chamfered Top-Left & Bottom-Right, Rounded Top-Right & Bottom-Left)
  const cardPath = `
    M ${chamfer} 0
    H ${Math.max(0, width - radius)}
    A ${radius} ${radius} 0 0 1 ${width} ${radius}
    V ${Math.max(0, height - chamfer)}
    L ${Math.max(0, width - chamfer)} ${height}
    H ${radius}
    A ${radius} ${radius} 0 0 1 0 ${Math.max(0, height - radius)}
    V ${chamfer}
    L ${chamfer} 0
    Z
  `
    .replace(/\s+/g, " ")
    .trim();

  // Corner decorations resting size (enlarged to 60px to match reference)
  const cornerDecoSize = 75;
  const cornerOffset = -15;

  // SVG paths for 60x60 coordinate space
  // Top-left triangle with rounded tips and hypotenuse facing down-right at 45 degrees
  const pathTL =
    "M 16 2 L 46 2 C 51 2 54 4 56 7 C 57 9 56 12 53 15 L 15 53 C 12 56 9 57 7 56 C 4 54 2 51 2 46 L 2 16 C 2 7 7 2 16 2 Z";

  // Bottom-right triangle (180° rotational symmetry)
  const pathBR =
    "M 44 58 L 14 58 C 9 58 6 56 4 53 C 3 51 4 48 7 45 L 45 7 C 48 4 51 3 53 4 C 56 6 58 9 58 14 L 58 44 C 58 53 53 58 44 58 Z";

  const isCentered =
    transitionState === "authenticating" ||
    transitionState === "success" ||
    transitionState === "exiting";

  // Symmetrical docking offset
  const centerSplitOffset = 8;
  const restingCenterX = cornerOffset + cornerDecoSize / 2; // 1 + 30 = 31
  const restingCenterY = cornerOffset + cornerDecoSize / 2; // 31

  const targetTL_X = width / 2 - centerSplitOffset;
  const targetTL_Y = height / 2 - centerSplitOffset;
  const deltaTL_X = isCentered ? targetTL_X - restingCenterX : 0;
  const deltaTL_Y = isCentered ? targetTL_Y - restingCenterY : 0;

  const deltaBR_X = isCentered ? -(targetTL_X - restingCenterX) : 0;
  const deltaBR_Y = isCentered ? -(targetTL_Y - restingCenterY) : 0;

  const animDuration = prefersReducedMotion
    ? "150ms"
    : isCentered
      ? "800ms"
      : "650ms";

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-[#0A0B0E]">
      {/* ============================================================ */}
      {/* SOFT AMBIENT LIGHTING BEAMS (Loyal to Reference)             */}
      {/* ============================================================ */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#121318_0%,#0A0B0E_100%)]" />

        {/* Top-Right warm ambient glow */}
        <div
          className="absolute -top-36 -right-20 w-[480px] h-[480px] rounded-full opacity-25 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(240, 174, 85, 0.45) 0%, rgba(200, 115, 20, 0.15) 50%, transparent 75%)",
          }}
        />

        {/* Bottom-Left warm ambient glow */}
        <div
          className="absolute -bottom-36 -left-20 w-[460px] h-[460px] rounded-full opacity-22 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(240, 174, 85, 0.38) 0%, rgba(180, 85, 10, 0.12) 50%, transparent 75%)",
          }}
        />

        {/* Diagonal soft illumination streak */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[130px] opacity-15 pointer-events-none blur-3xl transform -rotate-[35deg]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(240, 174, 85, 0.25) 40%, rgba(240, 174, 85, 0.3) 50%, rgba(200, 115, 20, 0.12) 65%, transparent 100%)",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* MAIN AUTHENTICATION CARD (Compact & Centered)                */}
      {/* ============================================================ */}
      <div
        ref={containerRef}
        className={clsx(
          "relative w-full max-w-[405px] z-10 transition-all duration-200 ease-out",
          transitionState === "exiting"
            ? "opacity-0 scale-[0.985]"
            : "opacity-100 scale-100",
          className,
        )}
      >
        {/* SVG Definition for Card Clipping and Crisp Outline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="cardOutlineGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.24)" />
              <stop offset="35%" stopColor="rgba(255, 255, 255, 0.07)" />
              <stop offset="75%" stopColor="rgba(240, 174, 85, 0.18)" />
              <stop offset="100%" stopColor="rgba(240, 174, 85, 0.38)" />
            </linearGradient>

            <filter
              id="cardOutlineShadow"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="14"
                floodColor="#000000"
                floodOpacity="0.75"
              />
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#F0AE55"
                floodOpacity="0.08"
              />
            </filter>

            <clipPath id="cardSurfaceClip">
              <path d={cardPath} />
            </clipPath>
          </defs>

          {/* Render Card Border */}
          <path
            d={cardPath}
            fill="none"
            stroke="url(#cardOutlineGrad)"
            strokeWidth="1.15"
            filter="url(#cardOutlineShadow)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Card Glass Surface */}
        <div
          className="absolute inset-0 backdrop-blur-2xl bg-[#111216]/82 pointer-events-none z-0"
          style={{ clipPath: "url(#cardSurfaceClip)" }}
          aria-hidden="true"
        />

        {/* Specular sheen */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-25"
          style={{
            clipPath: "url(#cardSurfaceClip)",
            background:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* ============================================================ */}
        {/* CORNER GEOMETRIC DECORATIONS (Larger & Naturally Integrated) */}
        {/* ============================================================ */}

        {/* Top-Left Corner Decoration */}
        <div
          className="absolute z-10 pointer-events-none will-change-transform"
          aria-hidden="true"
          style={{
            top: `${cornerOffset}px`,
            left: `${cornerOffset}px`,
            width: `${cornerDecoSize}px`,
            height: `${cornerDecoSize}px`,
            transform: `translate3d(${deltaTL_X}px, ${deltaTL_Y}px, 0) scale(${isCentered ? 1.28 : 1})`,
            transformOrigin: "center center",
            transition: `transform ${animDuration} cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease`,
          }}
        >
          <svg
            viewBox="0 0 60 60"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(240,174,85,0.18)]"
          >
            <path
              d={pathTL}
              fill={
                isCentered
                  ? "rgba(240, 174, 85, 0.08)"
                  : "rgba(255, 255, 255, 0.015)"
              }
              stroke={
                transitionState === "success"
                  ? "rgba(240, 174, 85, 1)"
                  : isCentered
                    ? "rgba(240, 174, 85, 0.9)"
                    : "rgba(255, 255, 255, 0.3)"
              }
              strokeWidth="1.2"
              className="transition-colors duration-400"
            />
          </svg>
        </div>

        {/* Bottom-Right Corner Decoration */}
        <div
          className="absolute z-10 pointer-events-none will-change-transform"
          aria-hidden="true"
          style={{
            bottom: `${cornerOffset}px`,
            right: `${cornerOffset}px`,
            width: `${cornerDecoSize}px`,
            height: `${cornerDecoSize}px`,
            transform: `translate3d(${deltaBR_X}px, ${deltaBR_Y}px, 0) scale(${isCentered ? 1.28 : 1})`,
            transformOrigin: "center center",
            transition: `transform ${animDuration} cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease`,
          }}
        >
          <svg
            viewBox="0 0 60 60"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(240,174,85,0.18)]"
          >
            <path
              d={pathBR}
              fill={
                isCentered
                  ? "rgba(240, 174, 85, 0.08)"
                  : "rgba(255, 255, 255, 0.015)"
              }
              stroke={
                transitionState === "success"
                  ? "rgba(240, 174, 85, 1)"
                  : isCentered
                    ? "rgba(240, 174, 85, 0.9)"
                    : "rgba(240, 174, 85, 0.38)"
              }
              strokeWidth="1.2"
              className="transition-colors duration-400"
            />
          </svg>
        </div>

        {/* Central Warm Radiant Aura when triangles meet */}
        <div
          className={clsx(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none transition-all duration-700 z-10",
            isCentered ? "opacity-100 scale-100" : "opacity-0 scale-75",
          )}
          style={{
            background:
              transitionState === "success"
                ? "radial-gradient(circle, rgba(240, 174, 85, 0.42) 0%, rgba(240, 174, 85, 0.18) 45%, transparent 72%)"
                : "radial-gradient(circle, rgba(240, 174, 85, 0.28) 0%, rgba(200, 115, 20, 0.1) 45%, transparent 72%)",
          }}
          aria-hidden="true"
        />

        {/* ============================================================ */}
        {/* CENTERED STATUS OVERLAY (AUTHENTICATING & SUCCESS)           */}
        {/* ============================================================ */}
        <div
          className={clsx(
            "absolute inset-0 z-30 flex flex-col items-center justify-center p-5 text-center transition-all duration-500",
            isCentered
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none",
          )}
        >
          {/* Spatial spacer for the docked emblem */}
          <div className="w-[80px] h-[80px] mb-6 relative flex items-center justify-center">
            {transitionState === "success" && (
              <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-75 duration-300">
                <div className="w-8 h-8 rounded-full bg-[#F0AE55] text-[#0D0E10] flex items-center justify-center shadow-lg shadow-[#F0AE55]/40">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-2.5 max-w-xs animate-in fade-in zoom-in-95 duration-500 delay-200">
            <h3 className="text-base font-bold text-[#F4F4F5] tracking-tight">
              {transitionState === "success"
                ? "ورود موفقیت‌آمیز"
                : "در حال اعتبارسنجی"}
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              {statusText ||
                "ارتباط امن با سرور برقرار شد؛ در حال بارگذاری اطلاعات..."}
            </p>

            {/* Glowing progress line */}
            <div className="w-28 h-1 bg-[#27272A] rounded-full mx-auto overflow-hidden mt-3">
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-500",
                  transitionState === "success"
                    ? "w-full bg-[#76A98C]"
                    : "w-full bg-[#F0AE55] origin-right animate-pulse",
                )}
              />
            </div>

            {transitionState === "authenticating" && onCancelSubmitting && (
              <button
                type="button"
                onClick={onCancelSubmitting}
                className="mt-3 text-[11px] text-[#A1A1AA] hover:text-[#F0AE55] transition-colors underline cursor-pointer"
              >
                انصراف و بازگشت به فرم
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD FORM CONTENT (Compact Spacing Matching Reference)       */}
        {/* ============================================================ */}
        <div
          className={clsx(
            "relative z-20 px-6 py-5 sm:px-7 sm:py-6 transition-all duration-300 ease-in-out",
            isCentered
              ? "opacity-0 scale-95 blur-[2px] pointer-events-none select-none"
              : "opacity-100 scale-100 blur-0 pointer-events-auto",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
