"use client";

import { useEffect, useRef, useState } from "react";

export interface UseDragScrollOptions {
  direction?: "horizontal" | "vertical" | "both";
  speed?: number;
  threshold?: number;
  momentum?: boolean;
}

// Cached RTL scroll type detection across browsers
let cachedRtlScrollType: "negative" | "reverse" | "default" | null = null;

export function getRtlScrollType(): "negative" | "reverse" | "default" {
  if (cachedRtlScrollType) return cachedRtlScrollType;
  if (typeof document === "undefined") return "negative";

  try {
    const dummy = document.createElement("div");
    dummy.dir = "rtl";
    dummy.style.position = "absolute";
    dummy.style.top = "-9999px";
    dummy.style.width = "4px";
    dummy.style.height = "1px";
    dummy.style.overflow = "scroll";
    dummy.style.visibility = "hidden";
    dummy.innerText = "xyz";
    document.body.appendChild(dummy);

    if (dummy.scrollLeft > 0) {
      cachedRtlScrollType = "default";
    } else {
      dummy.scrollLeft = 1;
      cachedRtlScrollType = dummy.scrollLeft === 0 ? "negative" : "reverse";
    }
    document.body.removeChild(dummy);
  } catch {
    cachedRtlScrollType = "negative";
  }

  return cachedRtlScrollType || "negative";
}

/**
 * useDragScroll
 * Enables direct click-and-drag scrolling for mouse and pointer users
 * with velocity momentum, click suppression on drag, and RTL support.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseDragScrollOptions = {}
) {
  const {
    direction = "horizontal",
    speed = 1,
    threshold = 5,
    momentum = true,
  } = options;

  const ref = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDown = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let momentumRafId: number | null = null;

    const rtlType = getRtlScrollType();

    const cancelMomentum = () => {
      if (momentumRafId !== null) {
        cancelAnimationFrame(momentumRafId);
        momentumRafId = null;
      }
    };

    const isInteractiveTag = (target: HTMLElement | null) => {
      if (!target) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "option" ||
        target.isContentEditable ||
        target.getAttribute("role") === "slider"
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Left click only
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      if (isInteractiveTag(target)) return;

      // Don't hijack if clicking scrollbars directly
      const rect = element.getBoundingClientRect();
      const isRtl = window.getComputedStyle(element).direction === "rtl";
      const scrollbarWidth = element.offsetWidth - element.clientWidth;
      const scrollbarHeight = element.offsetHeight - element.clientHeight;

      if (scrollbarWidth > 0) {
        if (isRtl && e.clientX >= rect.left && e.clientX <= rect.left + scrollbarWidth) return;
        if (!isRtl && e.clientX >= rect.right - scrollbarWidth && e.clientX <= rect.right) return;
      }
      if (scrollbarHeight > 0 && e.clientY >= rect.bottom - scrollbarHeight && e.clientY <= rect.bottom) {
        return;
      }

      cancelMomentum();

      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      startScrollLeft = element.scrollLeft;
      startScrollTop = element.scrollTop;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;

      // Mark element so global drag scroll doesn't duplicate
      element.setAttribute("data-drag-active", "true");

      window.addEventListener("mousemove", handleMouseMove, { passive: false });
      window.addEventListener("mouseup", handleMouseUp, { capture: true, once: true });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;

      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);

      if (!hasMoved) {
        if (totalDist < threshold) return;
        hasMoved = true;
        setIsDragging(true);
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
        element.style.cursor = "grabbing";
      }

      e.preventDefault();

      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      velocityX = dx / dt;
      velocityY = dy / dt;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      const isRtl = window.getComputedStyle(element).direction === "rtl";

      if (direction === "horizontal" || direction === "both") {
        if (isRtl && rtlType === "default") {
          element.scrollLeft += dx * speed;
        } else {
          element.scrollLeft -= dx * speed;
        }
      }

      if (direction === "vertical" || direction === "both") {
        element.scrollTop -= dy * speed;
      }
    };

    const handleMouseUp = () => {
      if (!isDown) return;

      isDown = false;
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      element.style.cursor = "";
      element.removeAttribute("data-drag-active");

      window.removeEventListener("mousemove", handleMouseMove);

      if (hasMoved) {
        // Prevent click events on buttons/links inside the container
        const suppressClick = (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };
        window.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => {
          window.removeEventListener("click", suppressClick, { capture: true });
        }, 50);

        // Momentum flick
        if (momentum && Math.hypot(velocityX, velocityY) > 0.15 && performance.now() - lastTime < 100) {
          let curVx = velocityX * 16 * speed;
          let curVy = velocityY * 16 * speed;
          const isRtl = window.getComputedStyle(element).direction === "rtl";

          const step = () => {
            if (Math.abs(curVx) < 0.2 && Math.abs(curVy) < 0.2) {
              momentumRafId = null;
              return;
            }

            if (direction === "horizontal" || direction === "both") {
              if (isRtl && rtlType === "default") {
                element.scrollLeft += curVx;
              } else {
                element.scrollLeft -= curVx;
              }
            }

            if (direction === "vertical" || direction === "both") {
              element.scrollTop -= curVy;
            }

            curVx *= 0.93;
            curVy *= 0.93;
            momentumRafId = requestAnimationFrame(step);
          };

          momentumRafId = requestAnimationFrame(step);
        }
      }
    };

    element.addEventListener("mousedown", handleMouseDown);

    return () => {
      cancelMomentum();
      element.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [direction, speed, threshold, momentum]);

  return ref;
}
