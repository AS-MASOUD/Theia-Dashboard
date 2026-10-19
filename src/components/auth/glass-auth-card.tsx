"use client";

import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";

interface GlassAuthCardProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
  statusText?: string;
  onCancelSubmitting?: () => void;
  className?: string;
}

export function GlassAuthCard({
  children,
  isSubmitting = false,
  statusText,
  onCancelSubmitting,
  className,
}: GlassAuthCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 460, height: 600 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  // Geometry parameters
  // Top-left and bottom-right are chamfered (cut at 45 degrees)
  // Top-right and bottom-left are rounded
  const chamfer = Math.min(58, Math.max(42, Math.floor(width * 0.12)));
  const radius = Math.min(28, Math.max(22, Math.floor(width * 0.06)));

  // SVG Path for the outer glass card
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
  `.replace(/\s+/g, " ").trim();

  // Emblem size in the center
  const emblemSize = 88;
  const cornerOffset = 10; // offset from top-left and bottom-right bounding box

  // Triangle SVG paths for 88x88 viewBox
  // Top-left triangle with rounded tips and hypotenuse facing down-right
  const pathTL = "M 20 3 L 58 3 C 64 3 67 6 70 12 L 12 70 C 6 67 3 64 3 58 L 3 20 C 3 10 10 3 20 3 Z";

  // Bottom-right triangle (180-degree rotation of top-left around (44, 44))
  const pathBR = "M 68 85 L 30 85 C 24 85 21 82 18 76 L 76 18 C 82 21 85 24 85 30 L 85 68 C 85 78 78 85 68 85 Z";

  // Calculate translation deltas from corners to exact center
  // Center position of emblem: (width/2 - emblemSize/2, height/2 - emblemSize/2)
  // Resting position of TL: (cornerOffset, cornerOffset)
  // Resting position of BR: (width - cornerOffset - emblemSize, height - cornerOffset - emblemSize)
  const targetCenterX = width / 2 - emblemSize / 2;
  const targetCenterY = height / 2 - emblemSize / 2;

  const deltaTL_X = isSubmitting ? targetCenterX - cornerOffset : 0;
  const deltaTL_Y = isSubmitting ? targetCenterY - cornerOffset : 0;

  const deltaBR_X = isSubmitting ? -(targetCenterX - cornerOffset) : 0;
  const deltaBR_Y = isSubmitting ? -(targetCenterY - cornerOffset) : 0;

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#08090B]">
      {/* Ambient Lighting & Golden Beams (matching reference) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep ambient dark radial */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#111216_0%,#08090B_100%)]" />

        {/* Top-Right diagonal warm golden beam */}
        <div
          className="absolute -top-32 -right-24 w-[560px] h-[560px] rounded-full opacity-40 blur-[90px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(245, 175, 65, 0.45) 0%, rgba(217, 119, 6, 0.18) 45%, transparent 75%)",
          }}
        />

        {/* Bottom-Left diagonal warm golden beam */}
        <div
          className="absolute -bottom-36 -left-28 w-[520px] h-[520px] rounded-full opacity-35 blur-[100px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(245, 175, 65, 0.35) 0%, rgba(180, 83, 9, 0.14) 50%, transparent 80%)",
          }}
        />

        {/* Angled diagonal light streak cutting through the scene */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[160px] opacity-20 pointer-events-none blur-3xl transform -rotate-[35deg]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(250, 204, 21, 0.25) 30%, rgba(245, 158, 11, 0.35) 50%, rgba(217, 119, 6, 0.15) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Main Glass Card Wrapper */}
      <div
        ref={containerRef}
        className={clsx(
          "relative w-full max-w-[460px] transition-all duration-500 ease-out z-10",
          className
        )}
      >
        {/* SVG Definition for Card Clipping and Crisp Glowing Border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Linear border gradient: white glass to warm amber glow */}
            <linearGradient id="glassBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.32)" />
              <stop offset="25%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="70%" stopColor="rgba(250, 204, 21, 0.25)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.45)" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="borderGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000000" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FACC15" floodOpacity="0.12" />
            </filter>

            {/* Clip path matching the chamfered card */}
            <clipPath id="authCardClip">
              <path d={cardPath} />
            </clipPath>
          </defs>

          {/* Card Border & Shadow */}
          <path
            d={cardPath}
            fill="none"
            stroke="url(#glassBorderGrad)"
            strokeWidth="1.2"
            filter="url(#borderGlow)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Backdrop Glass Surface (strictly clipped by the chamfered path) */}
        <div
          className="absolute inset-0 backdrop-blur-2xl bg-[#0F1014]/75 pointer-events-none"
          style={{ clipPath: "url(#authCardClip)" }}
        />

        {/* Inner ambient specular reflection */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            clipPath: "url(#authCardClip)",
            background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />

        {/* ============================================================ */}
        {/* CORNER TRIANGLES & SMOOTH REUNION ANIMATION */}
        {/* ============================================================ */}

        {/* Top-Left Triangle */}
        <div
          className="absolute z-20 pointer-events-none transition-transform will-change-transform"
          style={{
            top: `${cornerOffset}px`,
            left: `${cornerOffset}px`,
            width: `${emblemSize}px`,
            height: `${emblemSize}px`,
            transform: `translate3d(${deltaTL_X}px, ${deltaTL_Y}px, 0)`,
            transitionDuration: isSubmitting ? "850ms" : "700ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <svg
            viewBox="0 0 88 88"
            className="w-full h-full drop-shadow-[0_2px_12px_rgba(250,204,21,0.22)]"
          >
            <path
              d={pathTL}
              fill="rgba(255, 255, 255, 0.04)"
              stroke={isSubmitting ? "rgba(250, 204, 21, 0.95)" : "rgba(255, 255, 255, 0.38)"}
              strokeWidth="1.4"
              className="transition-colors duration-500"
            />
          </svg>
        </div>

        {/* Bottom-Right Triangle */}
        <div
          className="absolute z-20 pointer-events-none transition-transform will-change-transform"
          style={{
            bottom: `${cornerOffset}px`,
            right: `${cornerOffset}px`,
            width: `${emblemSize}px`,
            height: `${emblemSize}px`,
            transform: `translate3d(${deltaBR_X}px, ${deltaBR_Y}px, 0)`,
            transitionDuration: isSubmitting ? "850ms" : "700ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <svg
            viewBox="0 0 88 88"
            className="w-full h-full drop-shadow-[0_2px_12px_rgba(250,204,21,0.22)]"
          >
            <path
              d={pathBR}
              fill="rgba(255, 255, 255, 0.04)"
              stroke={isSubmitting ? "rgba(250, 204, 21, 0.95)" : "rgba(250, 204, 21, 0.55)"}
              strokeWidth="1.4"
              className="transition-colors duration-500"
            />
          </svg>
        </div>

        {/* Central Radial Bloom when triangles meet */}
        <div
          className={clsx(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none transition-all duration-700 z-15",
            isSubmitting
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75"
          )}
          style={{
            background: "radial-gradient(circle, rgba(250, 204, 21, 0.35) 0%, rgba(245, 158, 11, 0.15) 45%, transparent 72%)",
          }}
        />

        {/* Centered Status Overlay during submission (Image 2 representation) */}
        <div
          className={clsx(
            "absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 pointer-events-none",
            isSubmitting
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          {/* Spacing for the centered emblem */}
          <div className="w-[88px] h-[88px] mb-8" />

          {/* Status message */}
          <div className="space-y-3 max-w-xs animate-in fade-in zoom-in-95 duration-500 delay-300">
            <h3 className="text-lg font-bold text-[#F4F4F5] tracking-tight">
              در حال اعتبارسنجی
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {statusText || "ارتباط امن با سرور برقرار شد؛ در حال بارگذاری اطلاعات حساب کاربری..."}
            </p>

            {/* Subtle spinner pulse bar */}
            <div className="w-32 h-1 bg-[#27272A] rounded-full mx-auto overflow-hidden mt-4">
              <div className="w-full h-full bg-[#FACC15] origin-right animate-pulse" />
            </div>

            {onCancelSubmitting && (
              <button
                type="button"
                onClick={onCancelSubmitting}
                className="pointer-events-auto mt-4 text-[11px] text-[#A1A1AA] hover:text-[#FACC15] transition-colors underline cursor-pointer"
              >
                انصراف و بازگشت به فرم
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD FORM CONTENT */}
        {/* ============================================================ */}
        <div
          className={clsx(
            "relative z-10 px-7 py-9 sm:px-9 sm:py-11 transition-all duration-400 ease-in-out",
            isSubmitting
              ? "opacity-0 scale-95 blur-[2px] pointer-events-none select-none"
              : "opacity-100 scale-100 blur-0 pointer-events-auto"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
