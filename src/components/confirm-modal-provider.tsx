"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle2,
  X,
  HelpCircle,
} from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmOptions {
  title?: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface AlertModalOptions {
  title?: string;
  message: string;
  description?: string;
  buttonText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  showAlert: (options: AlertModalOptions | string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [config, setConfig] = useState<ConfirmOptions>({
    message: "",
    variant: "danger",
  });
  const [alertConfig, setAlertConfig] = useState<AlertModalOptions>({
    message: "",
    variant: "info",
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const alertResolverRef = useRef<(() => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setIsAlertMode(false);
      if (typeof options === "string") {
        setConfig({
          title: "تایید عملیات",
          message: options,
          confirmText: "تایید",
          cancelText: "انصراف",
          variant: "danger",
        });
      } else {
        setConfig({
          title: options.title || "تایید عملیات",
          message: options.message,
          description: options.description,
          confirmText: options.confirmText || (options.variant === "danger" ? "تایید و حذف" : "تایید"),
          cancelText: options.cancelText || "انصراف",
          variant: options.variant || "danger",
        });
      }
      setIsOpen(true);
    });
  }, []);

  const showAlert = useCallback((options: AlertModalOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      alertResolverRef.current = resolve;
      setIsAlertMode(true);
      if (typeof options === "string") {
        setAlertConfig({
          title: "اطلاعیه سامانه",
          message: options,
          buttonText: "متوجه شدم",
          variant: "info",
        });
      } else {
        setAlertConfig({
          title: options.title || "اطلاعیه سامانه",
          message: options.message,
          description: options.description,
          buttonText: options.buttonText || "متوجه شدم",
          variant: options.variant || "info",
        });
      }
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setIsOpen(false);
    if (isAlertMode) {
      if (alertResolverRef.current) {
        alertResolverRef.current();
        alertResolverRef.current = null;
      }
    } else {
      if (resolverRef.current) {
        resolverRef.current(result);
        resolverRef.current = null;
      }
    }
  }, [isAlertMode]);

  // Handle keyboard events (Escape to close, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose(false);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleClose(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const currentVariant = isAlertMode ? alertConfig.variant || "info" : config.variant || "danger";
  const title = isAlertMode ? alertConfig.title : config.title;
  const message = isAlertMode ? alertConfig.message : config.message;
  const description = isAlertMode ? alertConfig.description : config.description;

  const renderIcon = () => {
    switch (currentVariant) {
      case "danger":
        return (
          <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10 shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
        );
      case "warning":
        return (
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        );
      case "success":
        return (
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="h-11 w-11 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-lg shadow-sky-500/10 shrink-0">
            <Info className="h-5 w-5" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (currentVariant) {
      case "danger":
        return "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/25";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20";
      case "success":
        return "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-600/25";
      case "info":
      default:
        return "bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-sky-600/25";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, showAlert }}>
      {children}

      {/* Modern Obsidian Design Matched Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => handleClose(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#10131a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200 text-right"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Icon, Title and Close Button */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                {renderIcon()}
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {title}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    پیام سیستمی
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleClose(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                title="بستن پنجره"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Message */}
            <div className="space-y-2 py-1">
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {message}
              </p>
              {description && (
                <p className="text-xs text-slate-400 leading-relaxed bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  {description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              {!isAlertMode && (
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 font-semibold text-xs transition-all cursor-pointer"
                >
                  {config.cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer ${getConfirmButtonClasses()}`}
                autoFocus
              >
                {isAlertMode ? alertConfig.buttonText : config.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmModalProvider");
  }
  return context;
}
