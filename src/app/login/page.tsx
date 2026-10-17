"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Smartphone,
  RotateCcw,
} from "lucide-react";
import { normalizeDigitsToEnglish, isValidIranPhone, getSafeRedirect } from "@/lib/utils";

function LoginContent() {
  const { login, requestOTP, loginWithOTP } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"), "/");

  // Mode: "password" or "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // Common identifier: Phone or Email
  const [identifier, setIdentifier] = useState("");

  // Password mode
  const [password, setPassword] = useState("");

  // OTP mode
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpChannel, setOtpChannel] = useState<string>("sms");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Timer countdown effect
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
      toast.error("لطفاً شماره موبایل یا ایمیل خود را وارد نمایید.", "فیلد الزامی");
      return;
    }
    if (!cleanId.includes("@")) {
      if (!isValidIranPhone(cleanId)) {
        toast.error(
          "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و ۱۱ رقم باشد (مثال: 09123456789).",
          "شماره موبایل نامعتبر"
        );
        return;
      }
    }
    if (!password) {
      toast.error("لطفاً رمز عبور را وارد نمایید.", "فیلد الزامی");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({ identifier: cleanId, password });
      toast.success("ورود با موفقیت انجام شد. خوش آمدید!", "ورود موفق");
      router.push(redirectTarget);
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
        const msg = errorObj.message || "رمز عبور وارد شده نادرست است.";
        setError(msg);
        toast.error(msg, "خطای ورود");
      }
    } finally {
      setIsLoading(false);
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
        const msg = "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و ۱۱ رقم باشد (مثال: 09123456789).";
        setError(msg);
        toast.error(msg, "شماره موبایل نامعتبر");
        return;
      }
    }

    setError(null);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);

    try {
      await loginWithOTP(cleanId, cleanCode);
      toast.success("ورود موفقیت‌آمیز بود. خوش آمدید!", "ورود موفق");
      router.push(redirectTarget);
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
        const msg = errorObj.message || "کد وارد شده نامعتبر یا منقضی شده است.";
        setError(msg);
        toast.error(msg, "خطا در اعتبارسنجی");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-[16px] bg-[#141518] border border-[#282A2F] text-[#F0AE55] items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 stroke-[2]" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-[#E8E8E8]">
            ورود به سامانه مدیریت مالی
          </h2>
          <p className="text-xs text-[#9A9DA5]">
            ورود ایمن با شماره موبایل یا ایمیل
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-[14px] bg-[#76A98C]/12 border border-[#76A98C]/25 text-[#76A98C] text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-[14px] bg-[#C77A82]/12 border border-[#C77A82]/25 text-[#C77A82] text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#141518] p-6 rounded-[22px] border border-[#282A2F] shadow-xl space-y-5">
          {/* PASSWORD MODE FORM */}
          {authMode === "password" && (
            <form noValidate onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  شماره موبایل یا ایمیل
                </label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      const val = normalizeDigitsToEnglish(e.target.value);
                      if (!val.includes("@") && /^\d+$/.test(val)) {
                        if (val.length <= 11) setIdentifier(val);
                      } else {
                        setIdentifier(val);
                      }
                    }}
                    placeholder="09121111111 یا user@example.com"
                    dir="ltr"
                    className="w-full pr-10 pl-3 py-2.5 text-sm rounded-[14px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors text-left font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pr-10 pl-3 py-2.5 text-sm rounded-[14px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-[14px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-[#0D0E10] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ورود به سامانه</span>
                    <ArrowRight className="h-4 w-4 stroke-[2]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP MODE FORM */}
          {authMode === "otp" && (
            <div className="space-y-4">
              {/* Step 1: Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  شماره موبایل یا ایمیل
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                    <input
                      type="text"
                      disabled={otpSent && countdown > 0}
                      value={identifier}
                      onChange={(e) => {
                        const val = normalizeDigitsToEnglish(e.target.value);
                        if (!val.includes("@") && /^\d+$/.test(val)) {
                          if (val.length <= 11) setIdentifier(val);
                        } else {
                          setIdentifier(val);
                        }
                      }}
                      placeholder="09121111111 یا user@example.com"
                      dir="ltr"
                      className="w-full pr-10 pl-3 py-2.5 text-sm rounded-[14px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55]/50 transition-colors text-left font-mono disabled:opacity-70"
                    />
                  </div>
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={isLoading || !identifier.trim()}
                      className="px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] text-xs font-medium transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isLoading ? "در حال ارسال..." : "ارسال کد"}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2: OTP Verification code (Shown once sent) */}
              {otpSent && (
                <form noValidate onSubmit={handleVerifyOTP} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#9A9DA5]">
                        کد تایید ۵ رقمی ({otpChannel === "bale" ? "ارسال‌شده در بله" : otpChannel === "sms" ? "پیامک‌شده" : "ایمیل‌شده"})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                          setError(null);
                        }}
                        className="text-[11px] text-[#F0AE55] hover:underline cursor-pointer"
                      >
                        تغییر شماره / ایمیل
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
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
                        className="w-full pr-10 pl-3 py-3 text-lg rounded-[14px] border border-[#282A2F] bg-[#1B1D21] text-[#F0AE55] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] transition-colors text-center tracking-[0.4em] font-number font-semibold"
                      />
                    </div>
                  </div>

                  {/* Resend button / Countdown */}
                  <div className="flex items-center justify-between text-xs text-[#9A9DA5]">
                    {countdown > 0 ? (
                      <span className="font-number text-[#9A9DA5]">
                        ارسال مجدد کد پس از: {formatCountdown(countdown)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-[#F0AE55] hover:underline font-medium cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>ارسال مجدد کد تایید</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 5}
                    className="w-full py-3 px-4 rounded-[14px] bg-[#F0AE55] hover:bg-[#F5BA6E] text-[#0D0E10] font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-[#0D0E10] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>تایید و ورود به سامانه</span>
                        <ArrowRight className="h-4 w-4 stroke-[2]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Register footer link */}
        <div className="text-center text-xs text-[#9A9DA5]">
          <span>حساب کاربری ندارید؟ </span>
          <Link
            href="/register"
            className="text-[#F0AE55] font-medium hover:underline"
          >
            ثبت‌نام کاربر جدید
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center p-4">
          <div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
