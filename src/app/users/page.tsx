"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { SystemRole, User, UserCreateInput } from "@/types/auth";
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  UserCheck,
  Building2,
  Eye,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function UsersPage() {
  const { user: currentUser, isSysManager, isAdmin, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<SystemRole>("user");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<SystemRole>("user");

  // Fetch Users
  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users", searchTerm, selectedRole, selectedStatus],
    queryFn: () =>
      api.getUsers({
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        is_active: selectedStatus === "" ? undefined : selectedStatus === "active",
      }),
    enabled: isSysManager,
  });

  // Fetch Role Definitions
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.getRoles(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: UserCreateInput) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateModalOpen(false);
      resetCreateForm();
      setActionSuccess("کاربر با موفقیت ایجاد شد.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: SystemRole }) =>
      api.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsRoleModalOpen(false);
      setSelectedUserForRole(null);
      setActionSuccess("نقش کاربر با موفقیت به‌روزرسانی شد.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setActionSuccess("وضعیت دسترسی حساب کاربری تغییر یافت.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setActionSuccess("کاربر با موفقیت از سیستم حذف شد.");
      setTimeout(() => setActionSuccess(null), 4000);
    },
    onError: (err: Error) => {
      setActionError(err.message);
    },
  });

  const resetCreateForm = () => {
    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setNewRole("user");
    setActionError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const cleanName = newName.trim();
    if (!cleanName) {
      setActionError("نام و نام خانوادگی نمی‌تواند خالی باشد.");
      return;
    }
    if (cleanName.length < 2 || cleanName.length > 50) {
      setActionError("نام و نام خانوادگی باید بین ۲ تا ۵۰ کاراکتر باشد.");
      return;
    }
    createMutation.mutate({
      email: newEmail.trim(),
      full_name: cleanName,
      password: newPassword,
      role: newRole,
      is_active: true,
    });
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    setTargetNewRole(user.role);
    setActionError(null);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedUserForRole) return;
    setActionError(null);
    updateRoleMutation.mutate({
      id: selectedUserForRole.id,
      role: targetNewRole,
    });
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`آیا از حذف دائم کاربر "${user.full_name}" (${user.email}) اطمینان دارید؟`)) {
      setActionError(null);
      deleteMutation.mutate(user.id);
    }
  };

  // If user lacks permission
  if (!isSysManager && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
          <Shield className="h-8 w-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            دسترسی محدود به مدیران سامانه
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            بخش «مدیریت کاربران و نقش‌های سیستمی» اختصاصاً در اختیار دارندگان نقش{" "}
            <strong className="text-purple-600 dark:text-purple-400">مدیر ارشد (SysManager)</strong>{" "}
            یا <strong className="text-sky-600 dark:text-sky-400">مدیر مالی (Admin)</strong> قرار
            دارد.
          </p>
        </div>
      </div>
    );
  }

  const usersList = usersData?.items || [];
  const totalCount = usersData?.total || usersList.length;
  const sysManagerCount = usersList.filter((u) => u.role === "sysmanager").length;
  const adminCount = usersList.filter((u) => u.role === "admin").length;
  const regularCount = usersList.filter((u) => u.role === "user" || u.role === "viewer").length;

  const getRoleBadge = (role: SystemRole) => {
    switch (role) {
      case "sysmanager":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sparkles className="h-3 w-3" />
            <span>مدیر ارشد (SysManager)</span>
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Building2 className="h-3 w-3" />
            <span>مدیر مالی (Admin)</span>
          </span>
        );
      case "user":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <UserCheck className="h-3 w-3" />
            <span>کاربر استاندارد (User)</span>
          </span>
        );
      case "viewer":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Eye className="h-3 w-3" />
            <span>ناظر و بیننده (Viewer)</span>
          </span>
        );
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <span>در حال اعتبارسنجی دسترسی مدیر ارشد...</span>
        </div>
      </div>
    );
  }

  if (!isSysManager) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Shield className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            دسترسی انحصاری مدیر ارشد سامانه (SysManager)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            مدیریت کاربران، تغییر سطوح دسترسی و تخصیص نقش‌ها منحصراً در اختیار مدیر ارشد سامانه است.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
              مدیریت کاربران و نقش‌های سیستمی
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 pr-11">
            تعیین و ارتقاء نقش‌های کاربری (SysManager، Admin، User، Viewer) و کنترل دسترسی‌ها
          </p>
        </div>

        {isSysManager && (
          <button
            onClick={() => {
              resetCreateForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>افزودن کاربر جدید</span>
          </button>
        )}
      </div>

      {/* Success / Error Feedback Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[22px] border border-[#282A2F] bg-[#141518]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              کل حساب‌های کاربری
            </span>
            <Users className="h-4 w-4 text-[#696D77]" />
          </div>
          <p className="text-xl font-semibold mt-2 text-[#E8E8E8] font-mono">{totalCount}</p>
          <span className="text-xs text-[#9A9DA5]">ثبت‌شده در دیتابیس</span>
        </div>

        <div className="p-5 rounded-[22px] border border-[#282A2F] bg-[#141518]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              مدیران ارشد (SysManager)
            </span>
            <Sparkles className="h-4 w-4 text-[#F0AE55]" />
          </div>
          <p className="text-xl font-semibold mt-2 text-[#F0AE55] font-mono">
            {sysManagerCount}
          </p>
          <span className="text-xs text-[#9A9DA5]">دسترسی تام و تغییر نقش‌ها</span>
        </div>

        <div className="p-5 rounded-[22px] border border-[#282A2F] bg-[#141518]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              مدیران مالی (Admin)
            </span>
            <Building2 className="h-4 w-4 text-[#88A9BC]" />
          </div>
          <p className="text-xl font-semibold mt-2 text-[#88A9BC] font-mono">{adminCount}</p>
          <span className="text-xs text-[#9A9DA5]">مدیریت اسناد، دارایی و بودجه</span>
        </div>

        <div className="p-5 rounded-[22px] border border-[#282A2F] bg-[#141518]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#9A9DA5]">
              کاربران و ناظران
            </span>
            <UserCheck className="h-4 w-4 text-[#76A98C]" />
          </div>
          <p className="text-xl font-semibold mt-2 text-[#76A98C] font-mono">
            {regularCount}
          </p>
          <span className="text-xs text-[#9A9DA5]">کاربران عادی و ناظران فقط‌خواندنی</span>
        </div>
      </div>

      {/* Role Definitions Guide Cards */}
      <div className="p-5 rounded-[22px] border border-[#282A2F] bg-[#141518] space-y-3">
        <h3 className="text-xs font-semibold text-[#9A9DA5]">
          ماتریس سطوح دسترسی و اختیارات نقش‌ها
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {rolesData?.map((r) => (
            <div
              key={r.role}
              className="p-3.5 rounded-[14px] border border-[#282A2F] bg-[#1B1D21] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {r.name_fa}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: r.badge_color }}
                />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                {r.description_fa}
              </p>
              <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                {r.permissions.slice(0, 3).map((perm) => (
                  <span
                    key={perm}
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300"
                  >
                    {perm}
                  </span>
                ))}
                {r.permissions.length > 3 && (
                  <span className="text-[9px] text-slate-500 self-center">
                    +{r.permissions.length - 3} مورد دیگر
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-[22px] border border-[#282A2F] bg-[#141518] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-[#696D77]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو بر اساس نام یا ایمیل کاربر..."
            className="w-full pr-10 pl-3.5 py-2 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
          >
            <option value="" className="bg-[#141518]">همه نقش‌ها</option>
            <option value="sysmanager" className="bg-[#141518]">مدیر ارشد (SysManager)</option>
            <option value="admin" className="bg-[#141518]">مدیر مالی (Admin)</option>
            <option value="user" className="bg-[#141518]">کاربر عادی (User)</option>
            <option value="viewer" className="bg-[#141518]">ناظر (Viewer)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-[12px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] focus:outline-none focus:border-[#F0AE55]"
          >
            <option value="" className="bg-[#141518]">همه وضعیت‌ها</option>
            <option value="active" className="bg-[#141518]">فقط حساب‌های فعال</option>
            <option value="inactive" className="bg-[#141518]">فقط حساب‌های معلق</option>
          </select>

          <button
            onClick={() => refetch()}
            title="به‌روزرسانی فهرست"
            className="p-2 rounded-[12px] border border-[#282A2F] hover:bg-[#1B1D21] text-[#9A9DA5] hover:text-[#E8E8E8] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[22px] border border-[#282A2F] bg-[#141518] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#1B1D21] border-b border-[#282A2F] text-[#9A9DA5] font-medium">
              <tr>
                <th className="p-3.5 pr-6">مشخصات کاربر</th>
                <th className="p-3.5">نقش سیستمی</th>
                <th className="p-3.5">وضعیت حساب</th>
                <th className="p-3.5">تاریخ ثبت‌نام</th>
                <th className="p-3.5">آخرین ورود</th>
                <th className="p-3.5 pl-6 text-center">عملیات مدیریتی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282A2F]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#9A9DA5]">
                    در حال بارگذاری کاربران...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#9A9DA5]">
                    کاربری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#1B1D21]/30 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="p-3.5 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] flex items-center justify-center font-semibold text-xs text-[#F0AE55]">
                            {u.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#E8E8E8]">
                                {u.full_name}
                              </span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0AE55]/10 text-[#F0AE55] border border-[#F0AE55]/20">
                                  شما
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#9A9DA5] font-mono" dir="ltr">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">{getRoleBadge(u.role)}</td>

                      {/* Status */}
                      <td className="p-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-[#76A98C] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
                            <span>فعال</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#C77A82] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C77A82]" />
                            <span>معلق</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString("fa-IR")}
                      </td>

                      {/* Last Login */}
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleDateString("fa-IR")
                          : "ثبت‌نشده"}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pl-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSysManager ? (
                            <>
                              <button
                                onClick={() => handleOpenRoleModal(u)}
                                title="تغییر نقش کاربری"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-purple-500/20 hover:bg-purple-500/10 text-purple-400 transition-colors cursor-pointer"
                              >
                                تغییر نقش
                              </button>

                              <button
                                onClick={() =>
                                  toggleStatusMutation.mutate({
                                    id: u.id,
                                    isActive: !u.is_active,
                                  })
                                }
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? "امکان تغییر وضعیت حساب خود را ندارید"
                                    : u.is_active
                                    ? "تعلیق دسترسی"
                                    : "فعال‌سازی مجدد"
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                  u.is_active
                                    ? "border-amber-500/20 hover:bg-amber-500/10 text-amber-400"
                                    : "border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400"
                                }`}
                              >
                                {u.is_active ? "تعلیق" : "فعال‌سازی"}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={isSelf}
                                title={isSelf ? "امکان حذف حساب خود را ندارید" : "حذف دائم کاربر"}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">فقط مشاهده</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#10131a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-400" />
                <span>ایجاد کاربر جدید در سامانه</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="محمد حسینی"
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  پست الکترونیکی (ایمیل)
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="m.hosseini@company.com"
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-left font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  رمز عبور اولیه
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-left font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  نقش سیستمی انتخابی
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as SystemRole)}
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="sysmanager" className="bg-[#10131a]">مدیر ارشد سیستم (SysManager)</option>
                  <option value="admin" className="bg-[#10131a]">مدیر مالی (Admin)</option>
                  <option value="user" className="bg-[#10131a]">کاربر استاندارد (User)</option>
                  <option value="viewer" className="bg-[#10131a]">ناظر و بیننده (Viewer)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {createMutation.isPending ? "در حال ایجاد..." : "ایجاد کاربر"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {isRoleModalOpen && selectedUserForRole && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#10131a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>تغییر نقش سیستمی کاربر</span>
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07080b] border border-white/5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  {selectedUserForRole.full_name}
                </span>
                {getRoleBadge(selectedUserForRole.role)}
              </div>
              <span className="text-[11px] text-slate-400 font-mono block" dir="ltr">
                {selectedUserForRole.email}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300">
                نقش جدید موردنظر را انتخاب فرمایید:
              </label>
              <div className="space-y-2">
                {[
                  {
                    role: "sysmanager" as SystemRole,
                    title: "مدیر ارشد سیستم (SysManager)",
                    desc: "دسترسی تام و نامحدود، مدیریت کاربران و نقش‌ها، پیکربندی",
                    color: "border-purple-500/40 text-purple-300",
                  },
                  {
                    role: "admin" as SystemRole,
                    title: "مدیر مالی (Admin)",
                    desc: "دسترسی مدیریت کامل حساب‌ها، دارایی‌ها، تراکنش‌ها و گزارش‌ها",
                    color: "border-cyan-500/40 text-cyan-300",
                  },
                  {
                    role: "user" as SystemRole,
                    title: "کاربر استاندارد (User)",
                    desc: "ثبت و مدیریت داده‌های مالی و حساب‌های شخصی خود",
                    color: "border-emerald-500/40 text-emerald-300",
                  },
                  {
                    role: "viewer" as SystemRole,
                    title: "ناظر و بازبین (Viewer)",
                    desc: "دسترسی فقط‌خواندنی به پورتفولیو و نمودارهای آماری",
                    color: "border-white/20 text-slate-400",
                  },
                ].map((item) => (
                  <label
                    key={item.role}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetNewRole === item.role
                        ? `${item.color} bg-white/5 shadow-md`
                        : "border-white/10 hover:border-white/20 bg-[#07080b]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetRole"
                      value={item.role}
                      checked={targetNewRole === item.role}
                      onChange={() => setTargetNewRole(item.role)}
                      className="mt-0.5 text-amber-500 focus:ring-amber-500 accent-amber-500"
                    />
                    <div className="flex-1">
                      <span className="font-bold block">{item.title}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={updateRoleMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {updateRoleMutation.isPending ? "در حال ثبت..." : "ذخیره تغییرات نقش"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
