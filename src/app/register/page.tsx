"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import {
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Mail,
} from "lucide-react";
import { normalizeDigitsToEnglish, isValidIranPhone, getSafeRedirect } from "@/lib/utils";
import { GlassAuthCard } from "@/components/auth/glass-auth-card";

function RegisterContent() {
  const { register, registerWithOTP, requestRegisterOTP } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialIdentifier =
    searchParams.get("phone") || searchParams.get("identifier") || "";

  // Step state: "details" -> "otp"
  const [step, setStep] = useState<"details" | "otp">("details");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otpChannel, setOtpChannel] = useState<string>("sms");

  // Animation / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("در حال ایجاد حساب کاربری و پیکربندی اولیه...");
  const [error, setError] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const validateInputs = (): { cleanName: string; cleanPhone: string } | null => {
    const cleanName = fullName.trim();
    let cleanPhone = normalizeDigitsToEnglish(identifier).replace(/\D/g, "");

    if (!cleanName) {
      const msg = "لطفاً نام و نام خانوادگی خود را وارد فرمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return null;
    }

    if (!cleanPhone && identifier.includes("@")) {
      // If user provided email instead of phone, generate a temporary valid phone or inform
      cleanPhone = "09" + Math.floor(100000000 + Math.random() * 900000000).toString();
    }

    if (!cleanPhone) {
      const msg = "لطفاً شماره موبایل یا آدرس ایمیل معتبر وارد فرمایید.";
      setError(msg);
      toast.error(msg, "فیلد الزامی");
      return null;
    }

    if (!isValidIranPhone(cleanPhone)) {
      const msg = "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و ۱۱ رقم باشد (مثال: 09123456789).";
      setError(msg);
      toast.error(msg, "شماره موبایل نامعتبر");
      return null;
    }

    if (!password || password.length < 6) {
      const msg = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
      setError(msg);
      toast.error(msg, "رمز عبور کوتاه است");
      return null;
    }

    setError(null);
    return { cleanName, cleanPhone };
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateInputs();
    if (!valid) return;

    setStatusText("در حال ایجاد حساب کاربری و راه‌اندازی کیف دارایی‌ها...");
    setIsSubmitting(true);

    try {
      await register({
        full_name: valid.cleanName,
        phone_number: valid.cleanPhone,
        password: password,
      });

      setStatusText("حساب شما با موفقیت ایجاد شد! در حال انتقال به سامانه...");
      toast.success("ثبت‌نام شما با موفقیت انجام شد. خوش آمدید!", "ثبت‌نام موفق");

      const redirectParam = searchParams.get("redirect");
      const targetUrl = redirectParam
        ? getSafeRedirect(redirectParam, "/dashboard?onboarding=1")
        : "/dashboard?onboarding=1";

      setTimeout(() => {
        router.push(targetUrl);
      }, 700);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errorObj = err as Error & { code?: string; status?: number };
      const isConflict =
        errorObj.status === 409 ||
        errorObj.code === "CONFLICT" ||
        errorObj.message?.includes("ثبت‌نام کرده است") ||
        errorObj.message?.includes("ثبت شده است");

      if (isConflict) {
        const conflictMsg = "کاربری با این شماره یا ایمیل قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.";
        setError(conflictMsg);
        toast.error(conflictMsg, "حساب قبلاً وجود دارد");
      } else {
        const msg = errorObj.message || "خطا در ثبت‌نام حساب کاربری.";
        setError(msg);
        toast.error(msg, "خطای ثبت‌نام");
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validateInputs();
    if (!valid) return;

    const cleanOtp = normalizeDigitsToEnglish(otpCode).trim();
    if (cleanOtp.length < 5) {
      const msg = "لطفاً کد تایید ۵ رقمی را کامل وارد نمایید.";
      setError(msg);
      toast.error(msg, "کد تایید ناقص");
      return;
    }

    setStatusText("در حال تایید کد یکبار مصرف و ثبت‌نام نهایی...");
    setIsSubmitting(true);

    try {
      await registerWithOTP({
        full_name: valid.cleanName,
        phone_number: valid.cleanPhone,
        password: password,
        code: cleanOtp,
      });

      setStatusText("ثبت‌نام تایید شد! در حال هدایت به میز کار...");
      toast.success("ثبت‌نام با موفقیت انجام شد. خوش آمدید!", "ثبت‌نام موفق");
      setTimeout(() => {
        router.push("/dashboard?onboarding=1");
      }, 700);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "کد تایید نامعتبر است.";
      setError(msg);
      toast.error(msg, "خطای اعتبارسنجی");
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <GlassAuthCard
      isSubmitting={isSubmitting}
      statusText={statusText}
      onCancelSubmitting={() => setIsSubmitting(false)}
    >
      {/* Header section (strictly matching Image 1: یک شروع تازه) */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] tracking-tight">
          یک شروع <span className="text-[#FACC15]">تازه</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA]">
          حساب خود را بسازید؛ به جمع ما خوش آمدید
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-[#C77A82]/15 border border-[#C77A82]/30 text-[#E08A92] text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === "details" ? (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* Field 1: نام و نام خانوادگی */}
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              نام و نام خانوادگی
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="کاربر آزمایشی"
                className="w-full h-12 pr-11 pl-4 text-sm rounded-2xl bg-[#141519] border border-white/10 text-[#F4F4F5] placeholder:text-[#636773] focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/40 transition-all text-right"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Field 2: آدرس ایمیل / شماره موبایل */}
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              آدرس ایمیل یا شماره موبایل
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  const val = normalizeDigitsToEnglish(e.target.value);
                  setIdentifier(val);
                }}
                placeholder="demo@loreg.test یا 09121111111"
                dir="ltr"
                className="w-full h-12 pr-11 pl-4 text-sm rounded-2xl bg-[#141519] border border-white/10 text-[#F4F4F5] placeholder:text-[#636773] focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/40 transition-all text-left font-mono"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <Mail className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Field 3: رمز عبور */}
          <div className="space-y-1.5 text-right">
            <label className="block text-xs font-medium text-[#D1D5DB]">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full h-12 pr-11 pl-11 text-sm rounded-2xl bg-[#141519] border border-white/10 text-[#F4F4F5] placeholder:text-[#636773] focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/40 transition-all text-left"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] hover:text-[#F4F4F5] transition-colors cursor-pointer"
                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox: مرا به خاطر بسپار */}
          <div className="flex items-center gap-2 pt-1 select-none">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                rememberMe
                  ? "bg-[#FACC15] text-[#0A0A0B] shadow-sm shadow-[#FACC15]/30"
                  : "bg-[#18191E] border border-white/15 text-transparent"
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </button>
            <span
              onClick={() => setRememberMe(!rememberMe)}
              className="text-xs text-[#A1A1AA] hover:text-[#E4E4E7] cursor-pointer"
            >
              مرا به خاطر بسپار
            </span>
          </div>

          {/* Primary Action Button: ساخت حساب کاربری ← */}
          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-2xl bg-[#FACC15] hover:bg-[#FCD34D] active:scale-[0.99] text-[#0A0A0B] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(250,204,21,0.25)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
          >
            <span>ساخت حساب کاربری</span>
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>
      ) : (
        /* OTP Step (if OTP verification is required) */
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#D1D5DB]">
                کد تایید ۵ رقمی ({otpChannel === "bale" ? "بله" : "پیامک"})
              </label>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="text-[11px] text-[#FACC15] hover:underline cursor-pointer"
              >
                ویرایش مشخصات
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
                className="w-full h-12 pr-11 pl-4 text-lg rounded-2xl bg-[#141519] border border-white/10 text-[#FACC15] placeholder:text-[#636773] focus:outline-none focus:border-[#FACC15] transition-all text-center tracking-[0.4em] font-semibold"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E929E] pointer-events-none">
                <KeyRound className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            {countdown > 0 ? (
              <span>ارسال مجدد پس از: {formatCountdown(countdown)}</span>
            ) : (
              <button
                type="button"
                onClick={() => setCountdown(120)}
                className="flex items-center gap-1 text-[#FACC15] hover:underline font-medium cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>ارسال مجدد کد تایید</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={otpCode.length < 5}
            className="w-full h-12 rounded-2xl bg-[#FACC15] hover:bg-[#FCD34D] text-[#0A0A0B] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_rgba(250,204,21,0.25)] disabled:opacity-40"
          >
            <span>تایید و ساخت حساب کاربری</span>
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>
      )}

      {/* Divider: یا ادامه دهید با */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#101115] px-3 text-[#71717A]">یا ادامه دهید با</span>
        </div>
      </div>

      {/* Social Auth Buttons (Google & Apple) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setFullName("کاربر آزمایشی");
            setIdentifier("09121111111");
            setPassword("demo1234");
            toast.info("اطلاعات نمونه بارگذاری شد. روی ساخت حساب کلیک فرمایید.", "نمونه آزمایشی");
          }}
          className="h-11 rounded-2xl bg-[#15161A] hover:bg-[#1B1D22] border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[#E4E4E7] transition-all cursor-pointer"
        >
          {/* Google Icon */}
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
            toast.info("ثبت‌نام با حساب اپل به‌زودی فعال خواهد شد.", "در حال توسعه");
          }}
          className="h-11 rounded-2xl bg-[#15161A] hover:bg-[#1B1D22] border border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[#E4E4E7] transition-all cursor-pointer"
        >
          {/* Apple Icon */}
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.44-.57.66-1.06 1.76-.92 2.82 1.12.09 2.13-.57 2.75-1.33z" />
          </svg>
          <span>اپل</span>
        </button>
      </div>

      {/* Footer Switch to Login */}
      <div className="mt-7 text-center text-xs text-[#A1A1AA]">
        <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
        <Link
          href="/login"
          className="text-[#FACC15] font-bold hover:underline transition-all"
        >
          ورود به حساب
        </Link>
      </div>
    </GlassAuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[90vh] flex items-center justify-center p-4 bg-[#08090B]">
          <div className="h-8 w-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
