"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Check, Loader2, Plus, Edit2, Trash2, CheckCircle2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useUserPlatforms } from "@/hooks/use-user-platforms";
import { useCurrency } from "@/components/currency-provider";

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTransactionModal({ isOpen, onClose }: QuickTransactionModalProps) {
  const queryClient = useQueryClient();
  const { platforms, addPlatform, editPlatform, deletePlatform } = useUserPlatforms();
  const { exchangeRate, formatMoney } = useCurrency();

  const [txType, setTxType] = useState<string>("DEPOSIT");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [assetId, setAssetId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [txDate, setTxDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inline platform management state
  const [isManagingPlatforms, setIsManagingPlatforms] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [editingPlatformOld, setEditingPlatformOld] = useState<string | null>(null);
  const [editingPlatformNew, setEditingPlatformNew] = useState("");

  const { data: assets } = useQuery({
    queryKey: ["assets"],
    queryFn: () => api.getAssets(),
    enabled: isOpen,
  });

  const activeAssets = React.useMemo(() => assets?.filter((a) => a.is_active !== false) || [], [assets]);
  const effectivePlatform = selectedPlatform || (platforms.length > 0 ? platforms[0] : "");
  const selectedAssetId = assetId || (activeAssets.length > 0 ? activeAssets[0].id : "");
  const selectedAsset = activeAssets.find((a) => a.id === selectedAssetId);
  const selectedAssetCurrency = (txType === "BUY" || txType === "SELL") && selectedAsset ? (selectedAsset.currency || "TOMAN") : "TOMAN";

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const q = parseFloat(val);
    const p = parseFloat(unitPrice);
    if (!isNaN(q) && !isNaN(p) && (txType === "BUY" || txType === "SELL")) {
      setAmount((q * p).toFixed(4));
    }
  };

  const handleUnitPriceChange = (val: string) => {
    setUnitPrice(val);
    const q = parseFloat(quantity);
    const p = parseFloat(val);
    if (!isNaN(q) && !isNaN(p) && (txType === "BUY" || txType === "SELL")) {
      setAmount((q * p).toFixed(4));
    }
  };

  const handleAssetChange = (val: string) => {
    setAssetId(val);
    const selected = activeAssets?.find((a) => a.id === val);
    if (selected) {
      setUnitPrice(selected.current_price);
      const q = parseFloat(quantity);
      const p = parseFloat(selected.current_price);
      if (!isNaN(q) && !isNaN(p) && (txType === "BUY" || txType === "SELL")) {
        setAmount((q * p).toFixed(4));
      }
    }
  };

  const handleAddNewPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformName.trim()) return;
    const ok = addPlatform(newPlatformName.trim());
    if (ok) {
      setSelectedPlatform(newPlatformName.trim());
      setNewPlatformName("");
    }
  };

  const handleSaveEditPlatform = (oldName: string) => {
    if (!editingPlatformNew.trim()) return;
    editPlatform(oldName, editingPlatformNew.trim());
    if (selectedPlatform === oldName) {
      setSelectedPlatform(editingPlatformNew.trim());
    }
    setEditingPlatformOld(null);
    setEditingPlatformNew("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      if (!effectivePlatform) {
        throw new Error("لطفاً پلتفرم یا محل نگهداری دارایی را مشخص کنید.");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("لطفاً مبلغ معتبر را وارد کنید.");
      }

      let finalDate = new Date();
      if (txDate) {
        const [year, month, day] = txDate.split("-").map(Number);
        if (year && month && day) {
          finalDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        }
      }

      const payload: Record<string, unknown> = {
        platform: effectivePlatform,
        transaction_type: txType,
        transaction_date: finalDate.toISOString(),
        total_amount: amount,
        fee: "0",
        currency: selectedAssetCurrency,
        notes: notes || undefined,
      };

      if (txType === "BUY" || txType === "SELL") {
        if (!selectedAssetId) throw new Error("لطفاً نماد دارایی را انتخاب کنید.");
        if (!quantity || parseFloat(quantity) <= 0) throw new Error("لطفاً تعداد یا حجم را مشخص کنید.");
        payload.asset_id = selectedAssetId;
        payload.quantity = quantity;
        payload.unit_price = unitPrice || (parseFloat(amount) / parseFloat(quantity)).toFixed(4);
      }

      return api.createTransaction(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      onClose();
      // Reset form
      setAmount("");
      setQuantity("");
      setUnitPrice("");
      setNotes("");
      setTxDate(new Date().toISOString().split("T")[0]);
      setIsManagingPlatforms(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ثبت تراکنش";
      setErrorMsg(msg);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#10131a] border border-white/10 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              ثبت تراکنش جدید
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ثبت خرید، فروش، واریز یا برداشت در پلتفرم و محل نگهداری دارایی
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Transaction Type Tabs */}
        <div className="mt-4 grid grid-cols-4 gap-1 p-1 bg-[#07080b] border border-white/10 rounded-xl text-xs font-semibold">
          {[
            { id: "DEPOSIT", label: "واریز" },
            { id: "WITHDRAWAL", label: "برداشت" },
            { id: "BUY", label: "خرید دارایی" },
            { id: "SELL", label: "فروش دارایی" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTxType(item.id)}
              className={`py-2 rounded-lg transition-all cursor-pointer font-bold ${
                txType === item.id
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-4 space-y-4 text-xs"
        >
          {/* Platform / Storage Location */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-300">
                پلتفرم یا محل نگهداری دارایی
              </label>
              <button
                type="button"
                onClick={() => setIsManagingPlatforms(!isManagingPlatforms)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isManagingPlatforms ? "بستن مدیریت پلتفرم‌ها" : "+ افزودن / ویرایش پلتفرم‌ها"}
              </button>
            </div>

            <select
              value={effectivePlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-medium transition-colors"
            >
              {platforms.map((p) => (
                <option key={p} value={p} className="bg-[#10131a] text-slate-100">
                  {p}
                </option>
              ))}
            </select>

            {/* Inline Platform Manager Drawer */}
            {isManagingPlatforms && (
              <div className="p-3.5 bg-[#07080b] rounded-xl border border-white/10 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="نام پلتفرم جدید (مثلاً طلای زربد، کارگزاری خوارزمی...)"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-[#10131a] text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewPlatform}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-white/5">
                  {platforms.map((plat) => (
                    <div key={plat} className="flex items-center justify-between pt-2 pb-1.5 text-[11px]">
                      {editingPlatformOld === plat ? (
                        <div className="flex items-center gap-1 flex-1 ml-2">
                          <input
                            type="text"
                            value={editingPlatformNew}
                            onChange={(e) => setEditingPlatformNew(e.target.value)}
                            className="flex-1 px-2 py-1 rounded border border-amber-500 bg-[#10131a] text-slate-100 text-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditPlatform(plat)}
                            className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded cursor-pointer"
                            title="ذخیره"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlatformOld(null);
                              setEditingPlatformNew("");
                            }}
                            className="p-1 text-slate-400 hover:bg-white/5 rounded cursor-pointer"
                            title="انصراف"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-200 truncate font-medium">
                            {plat}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlatformOld(plat);
                                setEditingPlatformNew(plat);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                              title="ویرایش نام"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePlatform(plat)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conditional: Asset Selection for BUY/SELL */}
          {(txType === "BUY" || txType === "SELL") && (
            <>
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  دارایی (طلا، ارز، رمزارز، سهام)
                </label>
                {activeAssets.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                    هیچ دارایی فعالی در سامانه ثبت نشده است. لطفاً ابتدا به کاتالوگ دارایی‌ها رفته و دارایی مورد نظر خود را فعال کنید.
                  </div>
                ) : (
                  <select
                    value={selectedAssetId}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-medium transition-colors"
                  >
                    {activeAssets.map((asset) => {
                      const isUSD = asset.currency === "USD";
                      const pNum = parseFloat(asset.current_price);
                      const tomanEquiv = isUSD ? pNum * exchangeRate : pNum;

                      return (
                        <option key={asset.id} value={asset.id} className="bg-[#10131a] text-slate-100">
                          {asset.name} ({asset.symbol}) — {isUSD ? `$${pNum.toLocaleString("en-US")} USD` : `${pNum.toLocaleString("fa-IR")} تومان`}
                          {isUSD ? ` (≈ ${tomanEquiv.toLocaleString("fa-IR")} تومان)` : ""}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    تعداد / وزن / حجم
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="مثلاً 2.5 گرم یا سهم"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    قیمت واحد ({selectedAssetCurrency === "USD" ? "دلار USD" : "تومان"})
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={selectedAssetCurrency === "USD" ? "مثلاً 30.50" : "مثلاً 50,000,000"}
                    value={unitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  />
                  {unitPrice && !isNaN(parseFloat(unitPrice)) && parseFloat(unitPrice) > 0 && (
                    <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between font-mono">
                      <span>
                        {selectedAssetCurrency === "USD"
                          ? `≈ ${(parseFloat(unitPrice) * exchangeRate).toLocaleString("fa-IR")} تومان`
                          : `≈ $${exchangeRate > 0 ? (parseFloat(unitPrice) / exchangeRate).toFixed(2) : "0"} USD`}
                      </span>
                      {selectedAssetCurrency === "USD" && (
                        <span className="text-[10px] text-amber-400">
                          (نرخ دلار: {exchangeRate.toLocaleString("fa-IR")} تومان)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Transaction / Purchase Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>
                  {txType === "BUY"
                    ? "تاریخ خرید دارایی (جهت تحلیل سود و بازدهی)"
                    : txType === "SELL"
                    ? "تاریخ فروش دارایی"
                    : "تاریخ انجام تراکنش"}
                </span>
              </label>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { label: "امروز", daysAgo: 0 },
                  { label: "دیروز", daysAgo: 1 },
                  { label: "۱ هفته پیش", daysAgo: 7 },
                  { label: "۲ هفته پیش", daysAgo: 14 },
                  { label: "۱ ماه پیش", daysAgo: 30 },
                ].map((chip) => {
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() - chip.daysAgo);
                  const dateStr = targetDate.toISOString().split("T")[0];
                  const isSelected = txDate === dateStr;

                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setTxDate(dateStr)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "bg-white/5 hover:bg-white/10 text-slate-400"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-xs transition-colors"
            />
            {txDate && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                ثبت تاریخ: {formatDate(txDate)}
                {(() => {
                  try {
                    const [y, m, d] = txDate.split("-").map(Number);
                    const parsed = new Date(y, m - 1, d);
                    const shamsi = new Intl.DateTimeFormat("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(parsed);
                    return ` (${shamsi})`;
                  } catch {
                    return "";
                  }
                })()}
              </span>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              مبلغ کل تراکنش ({selectedAssetCurrency === "USD" ? "دلار USD" : "تومان"})
            </label>
            <input
              type="number"
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 focus:outline-none focus:border-amber-500 font-bold font-mono text-sm transition-colors"
            />
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="space-y-1.5 mt-2 font-mono">
                <span className="text-[11px] text-amber-400/80 block">
                  {selectedAssetCurrency === "USD"
                    ? `مبلغ کل: $${parseFloat(amount).toLocaleString("en-US")} USD`
                    : `مبلغ کل: ${parseFloat(amount).toLocaleString("fa-IR")} تومان`}
                </span>
                {selectedAssetCurrency === "USD" && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">معادل مبلغ کل به تومان:</span>
                    <span className="font-black text-amber-400 font-mono" dir="ltr">
                      {(parseFloat(amount) * exchangeRate).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              یادداشت یا بابت (اختیاری)
            </label>
            <input
              type="text"
              placeholder="مثلاً خرید پله‌ای ماهانه طلا، پس‌انداز، انتقال سرمایه"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#07080b] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 font-semibold hover:bg-white/5 text-slate-300 cursor-pointer transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>تأیید و ثبت تراکنش</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
