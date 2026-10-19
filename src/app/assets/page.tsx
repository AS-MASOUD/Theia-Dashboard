"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  Check,
  X,
  Loader2,
  RefreshCw,
  Coins,
  Gem,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { useToast } from "@/components/toast-provider";
import { useAuth } from "@/components/auth-provider";
import { useConfirm } from "@/components/confirm-modal-provider";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { Asset, AssetClass, MarketQuote } from "@/types/financial";

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();
  const { user, isSysManager } = useAuth();
  const { confirm } = useConfirm();

  // Fetch asset class definitions from backend
  const { data: assetClasses } = useQuery({
    queryKey: ["asset-classes"],
    queryFn: () => api.getAssetClasses(),
    staleTime: 5 * 60 * 1000,
  });

  // Derive the labels map from backend data
  const CLASS_LABELS: Record<string, string> = useMemo(() => {
    if (!assetClasses) return {};
    return Object.fromEntries(
      assetClasses.map((c: AssetClass) => [c.code, c.label]),
    );
  }, [assetClasses]);

  const [marketCategory, setMarketCategory] = useState<
    "all" | "gold" | "commodities" | "currencies" | "crypto"
  >("all");
  const categorySelectorRef = useDragScroll<HTMLDivElement>({ direction: "horizontal" });

  // Assets Filter: All, Active, Inactive
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Multi-Selection State for Bulk Deletion
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Add Asset Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetClass, setAssetClass] = useState("commodity");
  const [currency, setCurrency] = useState("TOMAN");
  const [price, setPrice] = useState("");
  const [isActiveNew, setIsActiveNew] = useState(false);
  const [notes, setNotes] = useState("");

  // User tracked assets state (by default for a new user, starts empty)
  const [trackedAssetIds, setTrackedAssetIds] = useState<string[] | null>(null);

  React.useEffect(() => {
    if (!user) return;
    if (isSysManager) return; // Sysmanager sees all catalog assets

    const storageKey = `theia_user_assets_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      try {
        setTrackedAssetIds(JSON.parse(stored));
      } catch {
        setTrackedAssetIds([]);
      }
    } else {
      // By default for a new user, start with an empty asset list
      setTrackedAssetIds([]);
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
  }, [user, isSysManager]);

  // Query assets catalog
  const { data: assets, isLoading: isAssetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => api.getAssets(),
  });

  // Query live market rates (auto-synced 5 times a day)
  const { data: marketRates, isLoading: isMarketLoading } = useQuery({
    queryKey: ["market-rates"],
    queryFn: () => api.getMarketRates(),
    staleTime: 60 * 1000,
  });

  // Mutation for manual market synchronization
  const syncMutation = useMutation({
    mutationFn: () => api.syncMarketRates(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["market-rates"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success(res.message, "همگام‌سازی بازار");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "خطا در همگام‌سازی نرخ‌ها.";
      toast.error(msg, "خطا در بروزرسانی");
    },
  });

  // Mutation for creating asset
  const createMutation = useMutation({
    mutationFn: () =>
      api.createAsset({
        symbol: symbol.toUpperCase().trim(),
        name: name.trim(),
        asset_class: assetClass,
        currency,
        initial_price: price || "0",
        is_active: isActiveNew,
        notes: notes.trim() || undefined,
      }),
    onSuccess: (newAsset: Asset) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      if (user && !isSysManager && newAsset?.id) {
        setTrackedAssetIds((prev) => {
          const next = Array.from(new Set([...(prev || []), newAsset.id]));
          localStorage.setItem(`theia_user_assets_${user.id}`, JSON.stringify(next));
          return next;
        });
      }
      setIsAddOpen(false);
      setSymbol("");
      setName("");
      setPrice("");
      setNotes("");
      setIsActiveNew(true);
      toast.success("دارایی جدید با موفقیت اضافه شد.", "ثبت دارایی");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در ایجاد دارایی.";
      toast.error(msg, "خطا");
    },
  });

  // Toggle Active Asset Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.updateAsset(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      toast.success("وضعیت فعال بودن دارایی بروزرسانی شد.", "تغییر وضعیت");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "خطا در تغییر وضعیت دارایی.";
      toast.error(msg, "خطا");
    },
  });

  // Delete Asset Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAsset(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      if (user && !isSysManager) {
        setTrackedAssetIds((prev) => {
          const next = (prev || []).filter((id) => id !== deletedId);
          localStorage.setItem(`theia_user_assets_${user.id}`, JSON.stringify(next));
          return next;
        });
      }
      toast.success("دارایی با موفقیت حذف شد.", "حذف دارایی");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "خطا در حذف دارایی.";
      toast.error(msg, "خطا");
    },
  });

  // Bulk Delete Asset Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.deleteAsset(id)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      setSelectedAssetIds([]);
      if (user && !isSysManager) {
        setTrackedAssetIds((prev) => {
          const next = (prev || []).filter((id) => !ids.includes(id));
          localStorage.setItem(`theia_user_assets_${user.id}`, JSON.stringify(next));
          return next;
        });
      }
      toast.success(
        `${ids.length} دارایی با موفقیت از کاتالوگ حذف شدند.`,
        "حذف دسته‌ای",
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "خطا در حذف دسته‌ای دارایی‌ها.";
      toast.error(msg, "خطا در حذف دسته‌ای");
    },
  });

  const handlePreFillAsset = (quote: MarketQuote) => {
    setSymbol(quote.symbol);
    setName(quote.name);
    setPrice(String(quote.price));

    let detectedClass = "commodity";
    let detectedCurrency = quote.unit === "دلار" ? "USD" : "TOMAN";

    if (quote.category === "crypto") {
      detectedClass = "crypto";
      detectedCurrency = "USD";
    } else if (quote.category === "currency") {
      detectedClass = "cash";
      detectedCurrency = "TOMAN";
    } else if (
      quote.symbol.includes("GOLD") ||
      quote.symbol.includes("COIN") ||
      quote.symbol.includes("XAU")
    ) {
      detectedClass = "commodity";
    }

    setAssetClass(detectedClass);
    setCurrency(detectedCurrency);
    setIsActiveNew(false);
    setIsAddOpen(true);
  };

  // Filtered market quotes
  const filteredQuotes: MarketQuote[] = useMemo(() => {
    if (!marketRates) return [];
    switch (marketCategory) {
      case "gold":
        return marketRates.gold_and_coins || [];
      case "commodities":
        return marketRates.commodities || [];
      case "currencies":
        return marketRates.currencies || [];
      case "crypto":
        return marketRates.cryptocurrency || [];
      case "all":
      default:
        return [
          ...(marketRates.gold_and_coins || []),
          ...(marketRates.commodities || []),
          ...(marketRates.currencies || []),
          ...(marketRates.cryptocurrency || []),
        ];
    }
  }, [marketRates, marketCategory]);

  // Registered Assets categorized by active status
  const { activeAssetsCount, inactiveAssetsCount, filteredRegisteredAssets } =
    useMemo(() => {
      if (!assets) {
        return {
          activeAssetsCount: 0,
          inactiveAssetsCount: 0,
          filteredRegisteredAssets: [],
        };
      }

      // For regular / new users, filter to only their tracked assets (default empty for new users)
      let baseAssets = assets;
      if (user && !isSysManager && trackedAssetIds !== null) {
        baseAssets = assets.filter((a) => trackedAssetIds.includes(a.id));
      }

      let activeCount = 0;
      let inactiveCount = 0;

      baseAssets.forEach((a) => {
        if (a.is_active !== false) {
          activeCount++;
        } else {
          inactiveCount++;
        }
      });

      let filtered = baseAssets;
      if (activeFilter === "active") {
        filtered = baseAssets.filter((a) => a.is_active !== false);
      } else if (activeFilter === "inactive") {
        filtered = baseAssets.filter((a) => a.is_active === false);
      }

      return {
        activeAssetsCount: activeCount,
        inactiveAssetsCount: inactiveCount,
        filteredRegisteredAssets: filtered,
      };
    }, [assets, activeFilter, user, isSysManager, trackedAssetIds]);

  return (
    <div className="space-y-6 ">
      {/* Header and Sync Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <span>کاتالوگ دارایی‌ها و نرخ‌های زنده بازار</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            پایش لحظه‌ای طلا، سکه، مس و کالاها، ارزهای جهانی و رمزارزها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
            title="دریافت آخرین قیمت‌ها از BRS API"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                syncMutation.isPending ? "animate-spin text-sky-500" : ""
              }`}
            />
            <span>
              {syncMutation.isPending
                ? "در حال بروزرسانی..."
                : "بروزرسانی نرخ‌های بازار"}
            </span>
          </button>

          <button
            onClick={() => {
              setSymbol("");
              setName("");
              setPrice("");
              setNotes("");
              setIsActiveNew(true);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>ثبت دارایی سفارشی</span>
          </button>
        </div>
      </div>

      {/* Live Market Section & Registered Assets Section Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Live Market Section */}
        <div className="obsidian-card p-6 space-y-4 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
              <h3 className="text-sm font-semibold text-[#E8E8E8]">
                نرخ‌های جاری بازارهای مالی
              </h3>
              {marketRates?.last_sync_time && (
                <span className="text-[11px] text-slate-400 font-mono">
                  (آخرین بروزرسانی: {formatDate(marketRates.last_sync_time)})
                </span>
              )}
            </div>

            {/* Market Category Selector */}
            <div
              ref={categorySelectorRef}
              className="flex items-center gap-1 bg-white/[0.04] border border-white/5 p-1 pb-1.5 rounded-xl text-xs font-medium overflow-x-auto max-w-full custom-scrollbar cursor-grab active:cursor-grabbing select-none"
            >
              {[
                { id: "all", label: "همه بازارها" },
                { id: "gold", label: "طلا و سکه ایران" },
                { id: "commodities", label: "کالاهای جهانی" },
                { id: "currencies", label: "دلار و ارزها" },
                { id: "crypto", label: "رمزارزها" },
              ].map((tab) => {
                const active = marketCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setMarketCategory(tab.id as typeof marketCategory)
                    }
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer text-xs select-none ${
                      active
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Rate Cards Grid */}
          {isMarketLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              نرخی یافت نشد. دکمه «بروزرسانی نرخ‌های بازار» را کلیک فرمایید.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredQuotes.map((quote) => {
                const isUSD = quote.unit === "دلار";
                const isPositive = (quote.change_percent ?? 0) >= 0;

                return (
                  <div
                    key={`${quote.category}-${quote.symbol}`}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                            {quote.symbol}
                          </span>
                          {quote.symbol === "XAUUSD" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                              اونس جهانی
                            </span>
                          )}
                          {quote.symbol === "IR_GOLD_18K" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                              ایران (گرم)
                            </span>
                          )}
                          {quote.symbol === "CU" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                              مس
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">
                          {quote.name}
                        </h4>
                      </div>

                      {quote.change_percent !== null &&
                        quote.change_percent !== undefined && (
                          <span
                            className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 border ${
                              isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                            dir="ltr"
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>
                              {quote.change_percent > 0
                                ? `+${quote.change_percent}%`
                                : `${quote.change_percent}%`}
                            </span>
                          </span>
                        )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-slate-100 font-mono">
                          {Number(quote.price).toLocaleString("en-US")}{" "}
                          {quote.unit}
                        </div>
                        {isUSD && quote.price_toman && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            ≈{" "}
                            {Number(quote.price_toman).toLocaleString("en-US")}{" "}
                            تومان
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handlePreFillAsset(quote)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-amber-500/30"
                        title="ثبت این نماد در دارایی‌های پایش‌شده من"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">ثبت در سبد</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Assets Section with Active / Deactive Management & Multi-Select */}
        <div className="obsidian-card p-6 space-y-4 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <span>دارایی‌های ثبت‌شده در سامانه</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مدیریت دارایی‌ها، انتخاب چندگانه و فعال‌سازی/غیرفعال‌سازی برای
                پورتفوی
              </p>
            </div>

            {/* Active / Inactive Filter Tabs & Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {filteredRegisteredAssets.length > 0 && (
                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={
                      filteredRegisteredAssets.length > 0 &&
                      filteredRegisteredAssets.every((a) =>
                        selectedAssetIds.includes(a.id),
                      )
                    }
                    onChange={() => {
                      const currentFilteredIds = filteredRegisteredAssets.map(
                        (a) => a.id,
                      );
                      const isAllSelected = currentFilteredIds.every((id) =>
                        selectedAssetIds.includes(id),
                      );
                      if (isAllSelected) {
                        setSelectedAssetIds((prev) =>
                          prev.filter((id) => !currentFilteredIds.includes(id)),
                        );
                      } else {
                        setSelectedAssetIds((prev) =>
                          Array.from(new Set([...prev, ...currentFilteredIds])),
                        );
                      }
                    }}
                    className="h-3.5 w-3.5 rounded border-white/20 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <span>انتخاب همه</span>
                </label>
              )}

              {selectedAssetIds.length > 0 && (
                <button
                  onClick={async () => {
                    const isConfirmed = await confirm({
                      title: "حذف دسته‌ای دارایی‌ها",
                      message: `آیا از حذف ${selectedAssetIds.length} دارایی انتخاب شده مطمئن هستید؟`,
                      description: "تمام نمادهای انتخاب‌شده از فهرست دارایی‌های شما حذف خواهند شد.",
                      confirmText: `حذف ${selectedAssetIds.length} دارایی`,
                      cancelText: "انصراف",
                      variant: "danger",
                    });
                    if (isConfirmed) {
                      bulkDeleteMutation.mutate(selectedAssetIds);
                    }
                  }}
                  disabled={bulkDeleteMutation.isPending}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {bulkDeleteMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>حذف دسته‌ای ({selectedAssetIds.length})</span>
                </button>
              )}

              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/5 p-1 rounded-xl text-xs font-semibold shrink-0">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                    activeFilter === "all"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  همه ({assets?.length || 0})
                </button>
                <button
                  onClick={() => setActiveFilter("active")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-xs ${
                    activeFilter === "active"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#76A98C]" />
                  <span>فعال ({activeAssetsCount})</span>
                </button>
                <button
                  onClick={() => setActiveFilter("inactive")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-xs ${
                    activeFilter === "inactive"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>غیرفعال ({inactiveAssetsCount})</span>
                </button>
              </div>
            </div>
          </div>

          {isAssetsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 bg-white/[0.02] border border-white/5 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : filteredRegisteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredRegisteredAssets.map((asset) => {
                const isActive = asset.is_active !== false;
                const isSelected = selectedAssetIds.includes(asset.id);

                return (
                  <div
                    key={asset.id}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50"
                        : isActive
                          ? "border-white/5 bg-white/[0.02] hover:border-amber-500/40 hover:shadow-lg"
                          : "border-dashed border-white/10 opacity-70 bg-white/[0.01]"
                    }`}
                  >
                    <div>
                      {/* Header Badges with Checkbox */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAssetIds((prev) => [
                                  ...prev,
                                  asset.id,
                                ]);
                              } else {
                                setSelectedAssetIds((prev) =>
                                  prev.filter((id) => id !== asset.id),
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-white/20 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500 shrink-0"
                          />
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300 font-mono border border-white/5">
                            {asset.symbol}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-white/5 text-slate-400 border-white/10"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-[#76A98C]" : "bg-[#696D77]"
                              }`}
                            />
                            <span>{isActive ? "فعال" : "غیرفعال"}</span>
                          </span>
                        </div>

                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          {CLASS_LABELS[asset.asset_class.toLowerCase()] ||
                            asset.asset_class}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs text-slate-100 mt-2 line-clamp-1">
                        {asset.name}
                      </h3>
                      {asset.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {asset.notes}
                        </p>
                      )}
                    </div>

                    {/* Price & Action Footer */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          نرخ ({asset.currency})
                        </span>
                        <span className="text-sm font-bold text-slate-100 font-mono">
                          {asset.currency === "TOMAN"
                            ? formatMoney(asset.current_price)
                            : `$${Number(asset.current_price).toLocaleString("en-US")}`}
                        </span>
                      </div>

                      {/* Actions: Active/Deactive Toggle & Delete */}
                      <div className="flex items-center gap-1">
                        {/* Active / Deactive Toggle Button */}
                        <button
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: asset.id,
                              is_active: !isActive,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isActive
                              ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                              : "text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                          title={
                            isActive
                              ? "غیرفعال‌سازی این دارایی"
                              : "فعال‌سازی این دارایی"
                          }
                        >
                          {isActive ? (
                            <Power className="h-3.5 w-3.5 text-emerald-400 hover:text-amber-400" />
                          ) : (
                            <PowerOff className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-400" />
                          )}
                        </button>

                        {/* Delete Asset Button */}
                        <button
                          onClick={async () => {
                            const isConfirmed = await confirm({
                              title: "حذف دارایی از سامانه",
                              message: `آیا از حذف نماد «${asset.symbol} - ${asset.name}» مطمئن هستید؟`,
                              description: "این نماد و تنظیمات مربوط به آن از فهرست دارایی‌های شما حذف خواهد شد.",
                              confirmText: "حذف دارایی",
                              cancelText: "انصراف",
                              variant: "danger",
                            });
                            if (isConfirmed) {
                              deleteMutation.mutate(asset.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="حذف دارایی"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-400 text-xs space-y-3">
              <p>
                {activeFilter === "inactive"
                  ? "هیچ دارایی غیرفعالی در سامانه ثبت نشده است."
                  : "هیچ دارایی فعالی در این بخش یافت نشد."}
              </p>
              {activeFilter !== "inactive" && (
                <button
                  onClick={() => {
                    setSymbol("");
                    setName("");
                    setPrice("");
                    setNotes("");
                    setIsActiveNew(true);
                    setIsAddOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>ثبت اولین دارایی</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="obsidian-card-elevated w-full max-w-md bg-[#12151e] border border-white/10 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-slate-100">
                ثبت دارایی جدید
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  نماد / تیکر (مثلاً IR_GOLD_18K, XAUUSD, Cu, BTC, USD)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً CU یا IR_GOLD_18K"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 placeholder:text-slate-500 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  نام کامل دارایی
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً طلای ۱۸ عیار یا مس جهانی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    دسته‌بندی دارایی
                  </label>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                  >
                    {assetClasses?.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    ارز پایه قیمت
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-mono"
                  >
                    <option value="TOMAN">تومان (TOMAN)</option>
                    <option value="USD">دلار (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  نرخ فعلی ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-bold"
                />
              </div>

              {/* Active Toggle on creation */}
              <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/10">
                <span className="text-slate-300 font-medium">
                  وضعیت دارایی در پورتفوی
                </span>
                <button
                  type="button"
                  onClick={() => setIsActiveNew(!isActiveNew)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActiveNew
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10"
                  }`}
                >
                  {isActiveNew ? "فعال" : "غیرفعال"}
                </button>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  یادداشت (اختیاری)
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیحات یا استراتژی سرمایه‌گذاری"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#0a0c12] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 font-semibold hover:bg-white/5 text-slate-300 cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  )}
                  <span>ثبت دارایی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
