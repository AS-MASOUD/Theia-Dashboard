"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import {
  Lock,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Mail,
} from "lucide-react";
import { normalizeDigitsToEnglish, isValidIranPhone, getSafeRedirect } from "@/lib/utils";
import { GlassAuthCard, AuthTransitionState } from "@/components/auth/glass-auth-card";

function LoginContent() {
  const { login, requestOTP, loginWithOTP, setAuthTransitioning } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"), "/dashboard");

  // Auth mode: "password" or "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // Form fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpChannel, setOtpChannel] = useState<string>("sms");

  // Transition & Animation state machine (Kept completely intact)
  const [transitionState, setTransitionState] = useState<AuthTransitionState>("idle");
  const [statusText, setStatusText] = useState<string>("در حال برقراری ارتباط امن و ورود به حساب...");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Release transition lock on unmount
  useEffect(() => {
    return () => {
      setAuthTransitioning(false);
    };
  }, [setAuthTransitioning]);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleUserNotFoundRedirect = (customIdentifier?: string) => {
    const rawId = (customIdentifier || identifier).trim();
    toast.error(
      "حساب کاربری با این مشخصات یافت نشد. در حال انتقال به صفحه ثبت‌نام...",
      "کاربر یافت نشد"
    );
    setError("حساب کاربری با این مشخصات یافت نشد. در حال انتقال به صفحه ثبت‌نام...");
    setTimeout(() => {
      const queryParam = rawId ? `?phone=${encodeURIComponent(rawId)}` : "";
      router.push(`/register${queryParam}`);
    }, 1200);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = normalizeDigitsToEnglish(identifier).trim();

    if (!cleanId) {
      const msg = "لطفاً شماره موبایل یا ایمیل خود را وارد نمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return;
    }
    if (!cleanId.includes("@")) {
      if (!isValidIranPhone(cleanId)) {
        const msg = "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و ۱۱ رقم باشد.";
        setError(msg);
        toast.error(msg, "شماره موبایل نامعتبر");
        return;
      }
    }
    if (!password) {
      const msg = "لطفاً رمز عبور را وارد نمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return;
    }

    // 1. Transition to authenticating state
    setError(null);
    setAuthTransitioning(true);
    setTransitionState("authenticating");
    setStatusText("در حال اعتبارسنجی رمز عبور و دریافت اطلاعات...");

    try {
      // 2. Perform real API call
      await login({ identifier: cleanId, password });

      // 3. API returned HTTP 200: Transition to SUCCESS state
      setTransitionState("success");
      setStatusText("ورود با موفقیت انجام شد! در حال آماده‌سازی میز کار...");
      toast.success("ورود با موفقیت انجام شد. خوش آمدید!", "ورود موفق");

      // 4. Allow the success celebration animation to play completely
      setTimeout(() => {
        // 5. Begin smooth screen exit transition
        setTransitionState("exiting");

        // 6. Navigate to dashboard only after the exit transition completes
        setTimeout(() => {
          router.push(redirectTarget);
        }, 220);
      }, 950);
    } catch (err: unknown) {
      setAuthTransitioning(false);
      setTransitionState("error");

      const errorObj = err as Error & { code?: string; status?: number };
      const isNotFound =
        errorObj.code === "USER_NOT_FOUND" ||
        errorObj.status === 404 ||
        errorObj.message?.includes("یافت نشد") ||
        errorObj.message?.includes("ثبت‌نام");

      if (isNotFound) {
        handleUserNotFoundRedirect(cleanId);
      } else {
        const msg = errorObj.message || "رمز عبور یا نام کاربری وارد شده نادرست است.";
        setError(msg);
        toast.error(msg, "خطای ورود");
      }
    }
  };

  const handleRequestOTP = async () => {
    const cleanId = normalizeDigitsToEnglish(identifier).trim();
    if (!cleanId) {
      const msg = "لطفاً شماره موبایل یا ایمیل خود را وارد نمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return;
    }

    if (!cleanId.includes("@")) {
      if (!isValidIranPhone(cleanId)) {
        const msg = "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و ۱۱ رقم باشد.";
        setError(msg);
        toast.error(msg, "شماره موبایل نامعتبر");
        return;
      }
    }

    setError(null);
    try {
      const res = await requestOTP(cleanId);
      setOtpSent(true);
      setCountdown(res.cooldown_seconds || 120);
      setOtpChannel(res.channel);
      const successText =
        res.channel === "bale"
          ? `کد تایید یکبار مصرف در پیام‌رسان بله به شماره ${res.identifier} ارسال شد.`
          : res.channel === "sms"
          ? `کد یکبار مصرف پیامکی به شماره ${res.identifier} ارسال شد.`
          : `کد تایید یکبار مصرف به ایمیل ${res.identifier} ارسال شد.`;
      setSuccessMsg(successText);
      toast.success(successText, "کد تایید ارسال شد");
    } catch (err: unknown) {
      const errorObj = err as Error & { code?: string; status?: number };
      const isNotFound =
        errorObj.code === "USER_NOT_FOUND" ||
        errorObj.status === 404 ||
        errorObj.message?.includes("یافت نشد") ||
        errorObj.message?.includes("ثبت‌نام");

      if (isNotFound) {
        handleUserNotFoundRedirect(cleanId);
      } else {
        const msg = errorObj.message || "خطا در ارسال کد یکبار مصرف.";
        setError(msg);
        toast.error(msg, "خطا در ارسال کد");
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = normalizeDigitsToEnglish(identifier).trim();
    const cleanCode = normalizeDigitsToEnglish(otpCode).trim();
    if (!cleanCode) {
      const msg = "لطفاً کد تایید را وارد نمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return;
    }

    setError(null);
    setAuthTransitioning(true);
    setTransitionState("authenticating");
    setStatusText("در حال اعتبارسنجی کد یکبار مصرف...");

    try {
      await loginWithOTP(cleanId, cleanCode);

      setTransitionState("success");
      setStatusText("ورود با موفقیت تایید شد! در حال انتقال به سامانه...");
      toast.success("ورود موفقیت‌آمیز بود. خوش آمدید!", "ورود موفق");

      setTimeout(() => {
        setTransitionState("exiting");
        setTimeout(() => {
          router.push(redirectTarget);
        }, 220);
      }, 950);
    } catch (err: unknown) {
      setAuthTransitioning(false);
      setTransitionState("error");

      const errorObj = err as Error & { code?: string; status?: number };
      const isNotFound =
        errorObj.code === "USER_NOT_FOUND" ||
        errorObj.status === 404 ||
        errorObj.message?.includes("یافت نشد") ||
        errorObj.message?.includes("ثبت‌نام");

      if (isNotFound) {
        handleUserNotFoundRedirect(cleanId);
      } else {
        const msg = errorObj.message || "کد وارد شده نامعتبر یا منقضی شده است.";
        setError(msg);
        toast.error(msg, "خطا در اعتبارسنجی");
      }
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <GlassAuthCard
      transitionState={transitionState}
      statusText={statusText}
      onCancelSubmitting={() => {
        setAuthTransitioning(false);
        setTransitionState("idle");
      }}
    >
      {/* Header section (matching Reference Image 1) */}
      <div className="text-center mb-3.5">
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#F4F4F5] tracking-tight">
          خوش <span className="text-[#F0AE55]">آمدید</span>
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          برای دسترسی به حساب خود، اطلاعات‌تان را وارد کنید
        </p>
      </div>

      {/* Auth Mode Toggle (Compact) */}
      <div className="flex items-center justify-center p-0.5 bg-[#15161A] border border-white/5 rounded-xl mb-3">
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setError(null);
          }}
          className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            authMode === "password"
              ? "bg-[#22242B] text-[#F0AE55] shadow-sm font-bold"
              : "text-[#8E929E] hover:text-[#D1D5DB]"
          }`}
        >
          ورود با رمز عبور
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("otp");
            setError(null);
          }}
          className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            authMode === "otp"
              ? "bg-[#22242B] text-[#F0AE55] shadow-sm font-bold"
              : "text-[#8E929E] hover:text-[#D1D5DB]"
          }`}
        >
          کد یکبار مصرف
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="mb-2.5 p-2 rounded-xl bg-[#76A98C]/15 border border-[#76A98C]/30 text-[#76A98C] text-xs flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-2.5 p-2 rounded-xl bg-[#C77A82]/15 border border-[#C77A82]/30 text-[#E08A92] text-xs flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PASSWORD MODE FORM */}
      {authMode === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {/* Identifier Input */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              آدرس ایمیل
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  const val = normalizeDigitsToEnglish(e.target.value);
                  setIdentifier(val);
                }}
                placeholder="name@domain.com"
                dir="ltr"
                className="auth-input h-[46px] pr-10 pl-3 text-sm text-left font-mono"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <Mail className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="auth-input h-[46px] pr-10 pl-10 text-sm text-left"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E929E] hover:text-[#F4F4F5] transition-colors cursor-pointer"
                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Symmetrical Row: Remember Me (Right) & Forgot Password (Left) matching Reference Image 1 */}
          <div className="flex items-center justify-between text-xs pt-0.5 select-none">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                  rememberMe
                    ? "bg-[#F0AE55] text-[#0D0E10] shadow-sm shadow-[#F0AE55]/30"
                    : "bg-[#18191E] border border-white/15 text-transparent"
                }`}
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </button>
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className="text-xs text-[#A1A1AA] hover:text-[#E4E4E7] cursor-pointer"
              >
                مرا به خاطر بسپار
              </span>
            </div>

            <Link
              href="/forgot-password"
              className="text-[11px] text-[#A1A1AA] hover:text-[#F0AE55] transition-colors"
            >
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </div>

          {/* Primary Action Button (Refined Warm Amber Surface) */}
          <button
            type="submit"
            className="w-full h-[46px] mt-1.5 rounded-2xl bg-gradient-to-r from-[#F3BE76] via-[#F0AE55] to-[#E89E3E] hover:brightness-105 active:scale-[0.99] text-[#0D0E10] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(240,174,85,0.25)] hover:shadow-[0_4px_28px_rgba(240,174,85,0.38)]"
          >
            <span>ورود به حساب</span>
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>
      )}

      {/* OTP MODE FORM */}
      {authMode === "otp" && (
        <div className="space-y-3">
          <div className="space-y-1 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              شماره موبایل یا ایمیل
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  disabled={otpSent && countdown > 0}
                  value={identifier}
                  onChange={(e) => {
                    const val = normalizeDigitsToEnglish(e.target.value);
                    setIdentifier(val);
                  }}
                  placeholder="09121111111 یا user@example.com"
                  dir="ltr"
                  className="auth-input h-[46px] pr-10 pl-3 text-sm text-left font-mono disabled:opacity-60"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={!identifier.trim()}
                  className="h-[46px] px-3.5 rounded-2xl bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                >
                  ارسال کد
                </button>
              )}
            </div>
          </div>

          {/* OTP Input code (if sent) */}
          {otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-3 pt-0.5">
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#D1D5DB]">
                    کد تایید ۵ رقمی ({otpChannel === "bale" ? "بله" : "پیامک"})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="text-[11px] text-[#F0AE55] hover:underline cursor-pointer"
                  >
                    تغییر شماره
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={otpCode}
                    onChange={(e) => {
                      const clean = normalizeDigitsToEnglish(e.target.value).replace(/\D/g, "");
                      if (clean.length <= 5) setOtpCode(clean);
                    }}
                    placeholder="•••••"
                    dir="ltr"
                    autoFocus
                    className="auth-input h-[46px] pr-10 pl-3 text-base text-[#F0AE55] text-center tracking-[0.4em] font-semibold"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                    <KeyRound className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Countdown / Resend */}
              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                {countdown > 0 ? (
                  <span>ارسال مجدد پس از: {formatCountdown(countdown)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="flex items-center gap-1 text-[#F0AE55] hover:underline font-medium cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>ارسال مجدد کد تایید</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={otpCode.length < 5}
                className="w-full h-[46px] rounded-2xl bg-gradient-to-r from-[#F3BE76] via-[#F0AE55] to-[#E89E3E] text-[#0D0E10] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(240,174,85,0.25)] disabled:opacity-40"
              >
                <span>تایید و ورود به حساب</span>
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Divider: یا ادامه دهید با */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-[11px]">
          <span className="bg-[#111216] px-2.5 text-[#71717A]">یا ادامه دهید با</span>
        </div>
      </div>

      {/* Social Auth Buttons (Google & Apple) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setIdentifier("09121111111");
            setPassword("demo1234");
            toast.info("اطلاعات نمونه بارگذاری شد. روی دکمه ورود کلیک فرمایید.", "حساب دمو");
          }}
          className="h-[38px] rounded-xl bg-[#15161A] hover:bg-[#1B1D22] border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[#E4E4E7] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>گوگل</span>
        </button>

        <button
          type="button"
          onClick={() => {
            toast.info("ورود با حساب اپل به‌زودی فعال خواهد شد.", "در حال توسعه");
          }}
          className="h-[38px] rounded-xl bg-[#15161A] hover:bg-[#1B1D22] border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[#E4E4E7] transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.44-.57.66-1.06 1.76-.92 2.82 1.12.09 2.13-.57 2.75-1.33z" />
          </svg>
          <span>اپل</span>
        </button>
      </div>

      {/* Footer Switch to Register (matching Reference Image 1) */}
      <div className="mt-3.5 text-center text-xs text-[#A1A1AA]">
        <span>هنوز حساب کاربری ندارید؟ </span>
        <Link
          href="/register"
          className="text-[#F0AE55] font-bold hover:underline transition-all"
        >
          ثبت‌نام
        </Link>
      </div>
    </GlassAuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center p-4 bg-[#0A0B0E]">
          <div className="h-8 w-8 border-2 border-[#F0AE55] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
