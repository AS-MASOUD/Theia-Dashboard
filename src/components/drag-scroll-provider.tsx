"use client";

import { useEffect } from "react";
import { getRtlScrollType } from "@/hooks/use-drag-scroll";

/**
 * GlobalDragScroll Provider
 * Enables intuitive click-and-drag panning anywhere in the application
 * where horizontal or vertical scrollable content exists.
 */
export function GlobalDragScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isDown = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let activeScrollEl: HTMLElement | null = null;
    let canScrollHorizontal = false;
    let canScrollVertical = false;
    let momentumRafId: number | null = null;

    const rtlType = getRtlScrollType();

    const cancelMomentum = () => {
      if (momentumRafId !== null) {
        cancelAnimationFrame(momentumRafId);
        momentumRafId = null;
      }
    };

    const isIgnoredElement = (target: HTMLElement | null, clientX: number, clientY: number): boolean => {
      if (!target) return true;

      // Skip elements handled by local useDragScroll
      if (target.closest('[data-drag-active="true"]')) return true;

      // Inputs, textareas, selects, range sliders, contenteditable
      const tag = target.tagName.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "option" ||
        target.isContentEditable ||
        target.getAttribute("role") === "slider"
      ) {
        return true;
      }

      // Charts and interactive SVGs/Canvases
      if (
        target.closest(".recharts-wrapper") ||
        target.closest(".MuiCharts-root") ||
        target.closest("canvas") ||
        target.closest("[data-no-drag-scroll]") ||
        target.closest(".no-drag-scroll")
      ) {
        return true;
      }

      // Check if user clicked directly on native scrollbar track or thumb
      const rect = target.getBoundingClientRect();
      const isRtl = window.getComputedStyle(target).direction === "rtl";
      const scrollbarWidth = target.offsetWidth - target.clientWidth;
      const scrollbarHeight = target.offsetHeight - target.clientHeight;

      if (scrollbarWidth > 0) {
        if (isRtl && clientX >= rect.left && clientX <= rect.left + scrollbarWidth) return true;
        if (!isRtl && clientX >= rect.right - scrollbarWidth && clientX <= rect.right) return true;
      }
      if (scrollbarHeight > 0 && clientY >= rect.bottom - scrollbarHeight && clientY <= rect.bottom) {
        return true;
      }

      return false;
    };

    const findScrollableContainer = (
      startEl: HTMLElement | null,
      deltaX: number,
      deltaY: number
    ): { el: HTMLElement; scrollX: boolean; scrollY: boolean } | null => {
      let current: HTMLElement | null = startEl;
      const isMoreHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      while (current && current !== document.body && current !== document.documentElement) {
        if (
          current.hasAttribute("data-no-drag-scroll") ||
          current.classList.contains("no-drag-scroll") ||
          current.getAttribute("data-drag-active") === "true"
        ) {
          return null;
        }

        const style = window.getComputedStyle(current);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;

        const hasScrollX =
          (overflowX === "auto" || overflowX === "scroll") &&
          current.scrollWidth > current.clientWidth + 2;

        const hasScrollY =
          (overflowY === "auto" || overflowY === "scroll") &&
          current.scrollHeight > current.clientHeight + 2;

        if (isMoreHorizontal) {
          if (hasScrollX) return { el: current, scrollX: true, scrollY: hasScrollY };
          if (hasScrollY && Math.abs(deltaY) > 5) return { el: current, scrollX: false, scrollY: true };
        } else {
          if (hasScrollY) return { el: current, scrollX: hasScrollX, scrollY: true };
          if (hasScrollX && Math.abs(deltaX) > 5) return { el: current, scrollX: true, scrollY: false };
        }

        current = current.parentElement;
      }

      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      // Only left mouse clicks
      if (e.button !== 0) return;

      // Preserve native text-selection shortcuts (double-click, shift+click, alt+click)
      if (e.detail > 1 || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (isIgnoredElement(target, e.clientX, e.clientY)) return;

      cancelMomentum();

      isDown = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;
      activeScrollEl = null;
      canScrollHorizontal = false;
      canScrollVertical = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;

      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);

      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      velocityX = deltaX / dt;
      velocityY = deltaY / dt;
      lastTime = now;

      // Wait for movement threshold to avoid blocking clicks
      if (!hasMoved) {
        if (totalDist < 5) return;

        const target = e.target as HTMLElement | null;
        const found = findScrollableContainer(target, e.clientX - startX, e.clientY - startY);
        if (!found) {
          isDown = false;
          return;
        }

        activeScrollEl = found.el;
        canScrollHorizontal = found.scrollX;
        canScrollVertical = found.scrollY;
        hasMoved = true;

        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }

      if (!activeScrollEl) return;

      const isRtl = window.getComputedStyle(activeScrollEl).direction === "rtl";

      if (canScrollHorizontal && deltaX !== 0) {
        if (isRtl && rtlType === "default") {
          activeScrollEl.scrollLeft += deltaX;
        } else {
          activeScrollEl.scrollLeft -= deltaX;
        }
      }

      if (canScrollVertical && deltaY !== 0) {
        activeScrollEl.scrollTop -= deltaY;
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isDown) return;

      isDown = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      if (hasMoved) {
        // Prevent accidental clicks on child buttons/links
        const suppressClick = (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        };
        window.addEventListener("click", suppressClick, { capture: true, once: true });
        setTimeout(() => {
          window.removeEventListener("click", suppressClick, { capture: true });
        }, 50);

        // Momentum flick glide
        const container = activeScrollEl;
        const scrollX = canScrollHorizontal;
        const scrollY = canScrollVertical;

        if (container && Math.hypot(velocityX, velocityY) > 0.15 && performance.now() - lastTime < 100) {
          let curVx = velocityX * 16;
          let curVy = velocityY * 16;
          const isRtl = window.getComputedStyle(container).direction === "rtl";

          const step = () => {
            if (Math.abs(curVx) < 0.2 && Math.abs(curVy) < 0.2) {
              momentumRafId = null;
              return;
            }

            if (scrollX && curVx !== 0) {
              if (isRtl && rtlType === "default") {
                container.scrollLeft += curVx;
              } else {
                container.scrollLeft -= curVx;
              }
            }

            if (scrollY && curVy !== 0) {
              container.scrollTop -= curVy;
            }

            curVx *= 0.93;
            curVy *= 0.93;
            momentumRafId = requestAnimationFrame(step);
          };

          momentumRafId = requestAnimationFrame(step);
        }
      }

      activeScrollEl = null;
    };

    window.addEventListener("mousedown", onMouseDown, { capture: false });
    window.addEventListener("mousemove", onMouseMove, { capture: false });
    window.addEventListener("mouseup", onMouseUp, { capture: true });

    return () => {
      cancelMomentum();
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp, { capture: true });
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, []);

  return null;
}
