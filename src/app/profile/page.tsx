"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { api } from "@/lib/api";
import {
  UserCircle,
  Mail,
  Smartphone,
  Briefcase,
  Calendar,
  Lock,
  Sparkles,
  Building2,
  UserCheck,
  Eye,
  Save,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  FileText,
  Clock,
  Scale,
  Award,
  TrendingUp,
  Coins,
  AlertTriangle,
  Sliders,
  LogOut,
} from "lucide-react";
import { SystemRole } from "@/types/auth";
import { FinancialOnboardingModal } from "@/components/onboarding/financial-onboarding-modal";
import { RiskAssessmentModal } from "@/components/onboarding/risk-assessment-modal";
import { CustomAllocationModal } from "@/components/financial/custom-allocation-modal";
import { calculatePortfolioAllocationCompliance } from "@/lib/allocation-utils";
import {
  normalizeDigitsToEnglish,
  isValidIranPhone,
  isValidFullName,
} from "@/lib/utils";

export default function ProfilePage() {
  const {
    user,
    updateProfile,
    refreshProfile,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuth();
  const { toast } = useToast();

  // Profile Edit State
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [job, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals State
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCustomAllocModal, setShowCustomAllocModal] = useState(false);

  // Fetch positions for portfolio allocation compliance check
  const { data: positions } = useQuery({
    queryKey: ["asset-positions"],
    queryFn: () => api.getPositions(),
  });

  const compliance = useMemo(() => {
    return calculatePortfolioAllocationCompliance(positions, user?.portfolio_suggestion);
  }, [positions, user?.portfolio_suggestion]);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync state when user loads or updates
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setEmail(user.email || "");
      setAge(
        user.age !== undefined && user.age !== null ? String(user.age) : "",
      );
      setJob(user.job || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleResetProfile = () => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setEmail(user.email || "");
      setAge(
        user.age !== undefined && user.age !== null ? String(user.age) : "",
      );
      setJob(user.job || "");
      setBio(user.bio || "");
      toast.info("تغییرات به مقادیر قبلی بازنشانی شدند.", "بازنشانی اطلاعات");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = fullName.trim();
    if (!cleanName) {
      toast.error("نام و نام خانوادگی نمی‌تواند خالی باشد.", "فیلد الزامی");
      return;
    }

    if (!isValidFullName(cleanName)) {
      toast.error(
        "نام و نام خانوادگی باید بین ۲ تا ۵۰ کاراکتر باشد.",
        "خطای اعتبارسنجی نام",
      );
      return;
    }

    const cleanPhone = normalizeDigitsToEnglish(phoneNumber).trim();
    if (cleanPhone && !isValidIranPhone(cleanPhone)) {
      toast.error(
        "شماره موبایل نامعتبر است. شماره باید با 09 شروع شده و دقیقاً ۱۱ رقم باشد (مثال: 09123456789).",
        "خطای اعتبارسنجی شماره موبایل",
      );
      return;
    }

    setIsSavingProfile(true);

    try {
      const parsedAge = age.trim()
        ? parseInt(normalizeDigitsToEnglish(age).trim(), 10)
        : null;
      if (
        parsedAge !== null &&
        (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120)
      ) {
        toast.error(
          "سن وارد شده باید عددی معتبر بین ۱۰ تا ۱۲۰ سال باشد.",
          "خطای اعتبارسنجی سن",
        );
        setIsSavingProfile(false);
        return;
      }

      await updateProfile({
        full_name: cleanName,
        phone_number: cleanPhone || null,
        email: email.trim() || null,
        age: parsedAge,
        job: job.trim() || null,
        bio: bio.trim() || null,
      });

      toast.success(
        "اطلاعات پروفایل شما با موفقیت به‌روزرسانی شد.",
        "به‌روزرسانی موفق",
      );
      await refreshProfile();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "خطا در ذخیره تغییرات پروفایل.";
      toast.error(msg, "خطای ذخیره‌سازی");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      toast.error("لطفاً رمز عبور فعلی را وارد نمایید.", "فیلد الزامی");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error(
        "طول رمز عبور جدید باید حداقل ۶ کاراکتر باشد.",
        "رمز عبور کوتاه",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "تکرار رمز عبور جدید با رمز عبور وارد شده همخوانی ندارد.",
        "عدم تطابق رمز عبور",
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success(
        "کلمه عبور شما با موفقیت تغییر یافت.",
        "تغییر موفق رمز عبور",
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "خطا در تغییر کلمه عبور.";
      toast.error(msg, "خطای تغییر رمز");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role: SystemRole) => {
    switch (role) {
      case "sysmanager":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0AE55]/10 text-[#F0AE55] border border-[#F0AE55]/20">
            <Sparkles className="h-3 w-3" />
            <span>مدیر ارشد سامانه (SysManager)</span>
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#88A9BC]/10 text-[#88A9BC] border border-[#88A9BC]/20">
            <Building2 className="h-3 w-3" />
            <span>مدیر مالی (Admin)</span>
          </span>
        );
      case "user":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#76A98C]/10 text-[#76A98C] border border-[#76A98C]/20">
            <UserCheck className="h-3 w-3" />
            <span>کاربر استاندارد (User)</span>
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#1B1D21] text-[#9A9DA5] border border-[#282A2F]">
            <Eye className="h-3 w-3" />
            <span>ناظر و بیننده (Viewer)</span>
          </span>
        );
    }
  };

  const getRiskLevelTitle = (level?: string | null) => {
    if (!level) return "تعیین نشده";
    if (level === "conservative" || level.includes("محافظه"))
      return "محافظه‌کارانه";
    if (level === "moderate" || level.includes("متعادل")) return "متعادل";
    if (
      level === "aggressive" ||
      level.includes("جسور") ||
      level.includes("ریسک")
    )
      return "جسورانه / ریسک‌پذیر";
    return level;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "ثبت نشده";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-[#9A9DA5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-[#F0AE55] border-t-transparent animate-spin" />
          <span>در حال بارگذاری مشخصات حساب کاربری...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-[16px] bg-[#141518] border border-[#282A2F] flex items-center justify-center text-[#696D77]">
          <UserCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-[#E8E8E8]">
          لطفاً برای مشاهده پروفایل ابتدا وارد شوید
        </h2>
        <a
          href="/login"
          className="px-4 py-2 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] text-xs font-medium transition-colors"
        >
          ورود به سامانه
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#E8E8E8] flex items-center gap-2.5">
            <UserCircle className="h-5 w-5 text-[#F0AE55]" />
            <span>پروفایل و اطلاعات کاربری</span>
          </h1>
          <p className="text-xs text-[#9A9DA5] mt-1">
            مشاهده، تکمیل و ویرایش مشخصات شخصی، سن، شغل، اطلاعات تماس و تنظیمات امنیتی
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            toast.success("با موفقیت از حساب کاربری خارج شدید.", "خروج از سامانه");
          }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[12px] border border-[#C77A82]/30 bg-[#C77A82]/10 hover:bg-[#C77A82]/20 text-[#C77A82] text-xs font-medium transition-colors cursor-pointer active:scale-95 shrink-0"
          title="خروج از حساب کاربری"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج از حساب کاربری</span>
        </button>
      </div>

      {/* User Hero Banner Card */}
      <div className="bg-[#141518] border border-[#282A2F] rounded-[22px] p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar pod */}
          <div className="h-16 w-16 rounded-[18px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center text-[#F0AE55] font-semibold text-2xl shrink-0">
            {user.full_name?.charAt(0) || "U"}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-right space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-lg font-semibold text-[#E8E8E8]">
                {user.full_name}
              </h2>
              {getRoleBadge(user.role)}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#76A98C]/10 text-[#76A98C] border border-[#76A98C]/30">
                <CheckCircle2 className="h-3 w-3" />
                حساب فعال
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#9A9DA5]">
              {user.phone_number && (
                <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                  <Smartphone className="h-3.5 w-3.5 text-[#696D77]" />
                  {user.phone_number}
                </span>
              )}
              {user.email && (
                <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                  <Mail className="h-3.5 w-3.5 text-[#696D77]" />
                  {user.email}
                </span>
              )}
              {user.job && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#696D77]" />
                  {user.job}
                </span>
              )}
              {user.age !== null && user.age !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#696D77]" />
                  {user.age} سال
                </span>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-5 text-[11px] text-[#696D77] border-t border-[#282A2F]">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                تاریخ عضویت: {formatDate(user.created_at)}
              </span>
              {user.last_login_at && (
                <span className="flex items-center gap-1">
                  آخرین ورود: {formatDate(user.last_login_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health & Risk Assessment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Financial Profile & Job Benchmark */}
        <div className="rounded-[22px] border border-[#282A2F] bg-[#141518] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#E8E8E8]">
                    اطلاعات مالی و موقعیت شغلی
                  </h3>
                  <p className="text-[11px] text-[#9A9DA5]">
                    درآمد، پس‌انداز و شاخص مقایسه‌ای حقوق بازار
                  </p>
                </div>
              </div>
              {user.has_completed_financial_onboarding ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#76A98C]/10 text-[#76A98C] border border-[#76A98C]/20">
                  <CheckCircle2 className="h-3 w-3" />
                  تکمیل شده
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0AE55]/10 text-[#F0AE55] border border-[#F0AE55]/20">
                  نیازمند تکمیل
                </span>
              )}
            </div>

            {user.has_completed_financial_onboarding ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
                    <span className="text-[11px] text-[#9A9DA5]">
                      عنوان شغل:
                    </span>
                    <p className="font-medium text-[#E8E8E8] mt-0.5">
                      {user.job || "ثبت نشده"}
                    </p>
                  </div>
                  <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
                    <span className="text-[11px] text-[#9A9DA5]">
                      درآمد ماهانه:
                    </span>
                    <p
                      className="font-medium text-[#76A98C] mt-0.5 font-mono"
                      dir="ltr"
                    >
                      {Number(user.monthly_income || 0).toLocaleString("en-US")}{" "}
                      <span className="text-[10px] font-sans text-[#9A9DA5] font-normal">
                        تومان
                      </span>
                    </p>
                  </div>
                  <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
                    <span className="text-[11px] text-[#9A9DA5]">
                      نقدینگی و پس‌انداز:
                    </span>
                    <p
                      className="font-medium text-[#E8E8E8] mt-0.5 font-mono"
                      dir="ltr"
                    >
                      {Number(user.liquid_assets || 0).toLocaleString("en-US")}{" "}
                      <span className="text-[10px] font-sans text-[#9A9DA5] font-normal">
                        تومان
                      </span>
                    </p>
                  </div>
                  <div className="p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
                    <span className="text-[11px] text-[#9A9DA5]">
                      سرمایه‌گذاری‌ها:
                    </span>
                    <p
                      className="font-medium text-[#F0AE55] mt-0.5 font-mono"
                      dir="ltr"
                    >
                      {Number(user.investment_assets || 0).toLocaleString(
                        "en-US",
                      )}{" "}
                      <span className="text-[10px] font-sans text-[#9A9DA5] font-normal">
                        تومان
                      </span>
                    </p>
                  </div>
                </div>

                {user.financial_goals && user.financial_goals.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      اهداف مالی برگزیده:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.financial_goals.map((g, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-[8px] text-[10px] font-medium bg-[#1B1D21] text-[#9A9DA5] border border-[#282A2F]"
                        >
                          {typeof g === "string" ? g : (g as any)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-[16px] bg-[#1B1D21]/50 border border-[#282A2F] text-xs text-[#9A9DA5] space-y-2 leading-relaxed">
                <p>
                  اطلاعات مالی و شغلی شما هنوز ثبت نشده است. با ثبت این اطلاعات،
                  میانگین حقوق بازار برای حوزه کاری شما محاسبه شده و نمودارهای
                  داشبورد فعال می‌شوند.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFinancialModal(true)}
            className="w-full py-2.5 px-4 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Briefcase className="h-4 w-4" />
            <span>
              {user.has_completed_financial_onboarding
                ? "ویرایش اطلاعات مالی و محاسبه مجدد"
                : "تکمیل اطلاعات مالی و شغلی"}
            </span>
          </button>
        </div>

        {/* Card 2: Risk Assessment & Portfolio Allocation */}
        <div className="rounded-[22px] border border-[#282A2F] bg-[#141518] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#282A2F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#E8E8E8]">
                    پروفایل روانشناسی ریسک و سبد دارایی
                  </h3>
                  <p className="text-[11px] text-[#9A9DA5]">
                    سنجش ظرفیت روانی تلاطم و تخصیص بهینه سرمایه‌گذاری
                  </p>
                </div>
              </div>
              {user.has_completed_risk_onboarding ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#76A98C]/10 text-[#76A98C] border border-[#76A98C]/20">
                  <CheckCircle2 className="h-3 w-3" />
                  آزمون انجام شده
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0AE55]/10 text-[#F0AE55] border border-[#F0AE55]/20">
                  نیازمند ارزیابی
                </span>
              )}
            </div>

            {user.has_completed_risk_onboarding || user.portfolio_suggestion ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#1B1D21] border border-[#282A2F]">
                  <div>
                    <span className="text-[11px] text-[#9A9DA5]">
                      سطح ریسک‌پذیری:
                    </span>
                    <p className="text-xs font-semibold text-[#F0AE55] mt-0.5">
                      {getRiskLevelTitle(user.risk_level)}
                    </p>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[11px] text-[#9A9DA5]">امتیاز:</span>
                    <p
                      className="text-sm font-semibold text-[#E8E8E8] mt-0.5"
                      dir="ltr"
                    >
                      {user.risk_score || 0} / 100
                    </p>
                  </div>
                </div>

                {/* Target vs Actual Allocation Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#9A9DA5]">
                      سقف تخصیص هدف پورتفوی vs موجودی فعلی:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomAllocModal(true)}
                      className="text-[11px] font-medium text-[#F0AE55] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="h-3 w-3" />
                      <span>ویرایش درصدهای هدف</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {compliance.items.map((item) => {
                      const isExceeded = item.isExceeded;
                      return (
                        <div
                          key={item.key}
                          className={`p-2 rounded-[12px] transition-colors border ${
                            isExceeded
                              ? "bg-[#C77A82]/10 text-[#C77A82] border-[#C77A82]/30"
                              : "bg-[#1B1D21] text-[#E8E8E8] border-[#282A2F]"
                          }`}
                        >
                          <div className="text-[10px] font-medium text-[#9A9DA5] truncate">
                            {item.label.split(" ")[0]}
                          </div>
                          <div className="text-xs font-semibold font-mono mt-0.5 text-[#E8E8E8]">
                            {item.targetPercent}٪
                          </div>
                          <div className="text-[10px] font-mono text-[#696D77] border-t border-[#282A2F] pt-0.5 mt-0.5">
                            فعلی: {item.actualPercent.toFixed(0)}٪
                          </div>
                          {isExceeded && (
                            <div className="text-[9px] font-medium text-[#C77A82] mt-0.5 flex items-center justify-center gap-0.5">
                              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                              <span>تخطی</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning banner inside Card 2 if any category is exceeded */}
                  {compliance.hasExceededCategory && (
                    <div className="p-3 rounded-[14px] bg-[#C77A82]/10 border border-[#C77A82]/25 text-[#E8E8E8] text-xs flex items-start gap-2 mt-2 leading-relaxed">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#C77A82]" />
                      <div>
                        <span className="font-medium block text-[#E8E8E8]">هشدار عدم انطباق پورتفوی با سقف ریسک:</span>
                        <span className="text-[11px] text-[#C77A82] block mt-0.5">
                          {compliance.exceededItems.map((item) => (
                            <span key={item.key} className="block font-mono">
                              • دسته «{item.label}»: سهم فعلی ({item.actualPercent.toFixed(1)}٪) از سقف هدف ({item.targetPercent}٪) به میزان +{item.excessPercent.toFixed(1)}٪ فراتر رفته است.
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-[16px] bg-[#1B1D21]/50 border border-[#282A2F] text-xs text-[#9A9DA5] space-y-2 leading-relaxed">
                <p>
                  شما هنوز در آزمون ۵ پرسشی روانشناسی ریسک شرکت نکرده‌اید. با
                  پاسخ به این پرسش‌ها، شخصیت سرمایه‌گذاری شما مشخص و درصد تخصیص
                  بهینه سهام، طلا و رمزارز پیشنهاد داده می‌شود.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowRiskModal(true)}
              className="py-2.5 px-3 rounded-[12px] bg-[#1B1D21] hover:bg-[#222327] text-[#E8E8E8] font-medium text-xs border border-[#282A2F] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Scale className="h-4 w-4 text-[#F0AE55]" />
              <span>
                {user.has_completed_risk_onboarding
                  ? "شرکت مجدد در آزمون"
                  : "آزمون روانشناسی ریسک"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomAllocModal(true)}
              className="py-2.5 px-3 rounded-[12px] bg-[#1B1D21] hover:bg-[#222327] text-[#E8E8E8] font-medium text-xs border border-[#282A2F] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sliders className="h-4 w-4 text-[#9A9DA5]" />
              <span>تنظیم درصدهای تخصیص</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Profile Edit & Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[22px] border border-[#282A2F] bg-[#141518] p-6 space-y-6">
            <div className="border-b border-[#282A2F] pb-3">
              <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#F0AE55]" />
                <span>ویرایش مشخصات هویتی و شغلی</span>
              </h3>
              <p className="text-xs text-[#9A9DA5] mt-0.5">
                فیلدهای سن، ایمیل و شغل برای شخصی‌سازی محاسبات بازنشستگی و
                گزارش‌ها استفاده می‌شوند.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9A9DA5]">
                    نام و نام خانوادگی <span className="text-[#C77A82]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full px-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-medium"
                  />
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9A9DA5]">
                    شماره موبایل
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                    <input
                      type="tel"
                      maxLength={11}
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = normalizeDigitsToEnglish(
                          e.target.value,
                        ).replace(/\D/g, "");
                        if (val.length <= 11) setPhoneNumber(val);
                      }}
                      placeholder="09123456789"
                      dir="ltr"
                      className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono text-left font-medium"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9A9DA5] flex items-center justify-between">
                    <span>پست الکترونیکی (ایمیل)</span>
                    <span className="text-[10px] text-[#696D77] font-normal">
                      اختیاری
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      dir="ltr"
                      className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono text-left font-medium"
                    />
                  </div>
                </div>

                {/* Age (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#9A9DA5] flex items-center justify-between">
                    <span>سن</span>
                    <span className="text-[10px] text-[#696D77] font-normal">
                      اختیاری (۱۰ تا ۱۲۰)
                    </span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="مثال: ۳۲"
                      dir="ltr"
                      className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono text-left font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Job / Profession */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5] flex items-center justify-between">
                  <span>شغل و حوزه فعالیت حرفه‌ای</span>
                  <span className="text-[10px] text-[#696D77] font-normal">
                    اختیاری
                  </span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-3 h-4 w-4 text-[#696D77]" />
                  <input
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="مثال: مهندس نرم‌افزار / تحلیل‌گر بازار مالی / پزشک"
                    className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Bio / Financial Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5] flex items-center justify-between">
                  <span>درباره من / استراتژی و اهداف سرمایه‌گذاری</span>
                  <span className="text-[10px] text-[#696D77] font-normal">
                    اختیاری
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="یادداشت‌های شخصی در مورد چشم‌انداز بازنشستگی، رویکرد به ریسک و ترجیحات دارایی..."
                  className="w-full p-3.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors resize-none leading-relaxed font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] font-medium text-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <div className="h-4 w-4 border-2 border-[#0D0E10] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>ذخیره تغییرات پروفایل</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetProfile}
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] border border-[#282A2F] bg-[#1B1D21] hover:bg-[#222327] text-[#9A9DA5] text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>بازنشانی فرم</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Security & Password Change */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="rounded-[22px] border border-[#282A2F] bg-[#141518] p-6 space-y-4">
            <div className="border-b border-[#282A2F] pb-3">
              <h3 className="text-sm font-semibold text-[#E8E8E8] flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#F0AE55]" />
                <span>تغییر کلمه عبور</span>
              </h3>
              <p className="text-xs text-[#9A9DA5] mt-0.5">
                تعیین یا به‌روزرسانی رمز عبور ثابت حساب کاربری
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  رمز عبور فعلی
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-[#696D77]" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  رمز عبور جدید (حداقل ۶ کاراکتر)
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-[#696D77]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#9A9DA5]">
                  تکرار رمز عبور جدید
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-[#696D77]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pr-9 pl-3.5 py-2.5 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 px-4 rounded-[12px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] font-medium text-xs active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isChangingPassword ? (
                  <div className="h-4 w-4 border-2 border-[#0D0E10] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>به‌روزرسانی رمز عبور</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account System Info */}
          <div className="rounded-[18px] border border-[#282A2F] bg-[#141518] p-4 space-y-2.5 text-xs">
            <h4 className="font-semibold text-[#E8E8E8]">
              اطلاعات امنیتی نشست
            </h4>
            <div className="space-y-1.5 text-[#9A9DA5] text-[11px]">
              <div className="flex justify-between">
                <span>شناسه کاربری (UUID):</span>
                <span className="font-mono text-[10px] text-[#696D77]" dir="ltr">
                  {user.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span>روش‌های ورود فعال:</span>
                <span className="text-[#76A98C] font-medium">
                  OTP پیامکی + رمز ثابت
                </span>
              </div>
              <div className="flex justify-between">
                <span>سطح دسترسی:</span>
                <span className="font-medium text-[#E8E8E8]">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Termination / Logout Card */}
      <div className="rounded-[22px] border border-[#C77A82]/20 bg-[#141518] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-sm font-semibold text-[#C77A82] flex items-center gap-2 justify-center sm:justify-start">
            <LogOut className="h-4 w-4" />
            <span>پایان نشست و خروج از حساب کاربری</span>
          </h3>
          <p className="text-xs text-[#9A9DA5]">
            با خروج از حساب، نشست فعلی شما خاتمه یافته و توکن دسترسی از این دستگاه پاک خواهد شد.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            toast.success("با موفقیت از حساب کاربری خارج شدید.", "خروج از سامانه");
          }}
          className="px-4 py-2 rounded-[12px] bg-[#C77A82]/10 hover:bg-[#C77A82]/20 border border-[#C77A82]/30 active:scale-95 text-[#C77A82] text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج از حساب</span>
        </button>
      </div>

      {/* Onboarding Modals */}
      <FinancialOnboardingModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
        onSuccess={async () => {
          setShowFinancialModal(false);
          await refreshProfile();
          toast.success(
            "اطلاعات مالی و شغلی با موفقیت به‌روزرسانی شد.",
            "به‌روزرسانی موفق",
          );
        }}
        initialData={{
          job: user.job || "",
          monthly_income: user.monthly_income ? Number(user.monthly_income) : 0,
          liquid_assets: user.liquid_assets ? Number(user.liquid_assets) : 0,
          investment_assets: user.investment_assets
            ? Number(user.investment_assets)
            : 0,
          total_liabilities: user.total_liabilities
            ? Number(user.total_liabilities)
            : 0,
          financial_goals: user.financial_goals || [],
        }}
      />

      <RiskAssessmentModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onSuccess={async () => {
          setShowRiskModal(false);
          await refreshProfile();
        }}
        initialAnswers={user.risk_answers || undefined}
      />

      <CustomAllocationModal
        isOpen={showCustomAllocModal}
        onClose={() => setShowCustomAllocModal(false)}
        onSuccess={async () => {
          await refreshProfile();
        }}
      />
    </div>
  );
}
