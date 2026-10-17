"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-white/[0.08] text-xs text-[#F0AE55]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ارتباط با پشتیبانی و تیم توسعه</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F1] tracking-tight">
            تماس با ما و پیشنهادات شما
          </h1>
          <p className="text-sm md:text-base text-[#A0A3AD] leading-relaxed max-w-xl mx-auto">
            دیدگاه‌ها، پیشنهادات قابلیت‌های جدید و گزارش‌های شما، مستقیماً به تیم مهندسی تئا منتقل می‌شود.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Info Side */}
          <div className="md:col-span-5 space-y-5">
            <div className="rounded-[22px] bg-[#141519] border border-white/[0.08] p-6 space-y-5">
              <h3 className="text-base font-bold text-[#F0F0F1]">کانال‌های ارتباطی</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 text-[#A0A3AD]">
                  <div className="w-8 h-8 rounded-full bg-[#1B1D22] flex items-center justify-center text-[#F0AE55] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#707581] block">ایمیل پشتیبانی:</span>
                    <span className="font-mono text-[#F0F0F1]">support@theia-finance.ir</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#A0A3AD]">
                  <div className="w-8 h-8 rounded-full bg-[#1B1D22] flex items-center justify-center text-[#76A98C] shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#707581] block">پیام‌رسان بله و تلگرام:</span>
                    <span className="font-mono text-[#F0F0F1]">@TheiaFinanceBot</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#A0A3AD]">
                  <div className="w-8 h-8 rounded-full bg-[#1B1D22] flex items-center justify-center text-[#88A9BC] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#707581] block">مرکز استقرار:</span>
                    <span className="text-[#F0F0F1]">تهران، پارک فناوری اطلاعات</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-gradient-to-br from-[#17181D] to-[#121316] border border-[#F0AE55]/20 p-5 space-y-2">
              <p className="text-xs font-bold text-[#F0AE55]">پاسخگویی سریع</p>
              <p className="text-[11px] text-[#A0A3AD] leading-relaxed">
                پیام‌های ارسالی حداکثر ظرف مدت ۲۴ ساعت کاری توسط مهندسان محصول بررسی و پاسخ داده خواهند شد.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7 rounded-[24px] bg-[#141519] border border-white/[0.08] p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#76A98C] mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-[#F0F0F1]">پیام شما با موفقیت ثبت شد</h3>
                <p className="text-xs text-[#A0A3AD] max-w-sm mx-auto">
                  از اینکه با ما در تماس هستید سپاسگزاریم. به زودی از طریق ایمیل پاسخگوی شما خواهیم بود.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                    نام و نام خانوادگی:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="امیرمسعود صالحی"
                    className="w-full bg-[#1B1D21] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] px-3.5 py-2.5 text-xs text-[#F0F0F1] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                    پست الکترونیک (ایمیل):
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-[#1B1D21] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] px-3.5 py-2.5 text-xs text-[#F0F0F1] outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                    موضوع پیام:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="پیشنهاد ماژول جدید / سوال فنی"
                    className="w-full bg-[#1B1D21] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] px-3.5 py-2.5 text-xs text-[#F0F0F1] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A0A3AD] mb-1.5">
                    متن پیام:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="توضیحات خود را اینجا بنویسید..."
                    className="w-full bg-[#1B1D21] border border-white/[0.08] focus:border-[#F0AE55] rounded-[12px] p-3 text-xs text-[#F0F0F1] outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-[13px] bg-[#F0AE55] hover:bg-[#F3BE76] text-[#0D0E10] text-xs font-bold transition-all shadow-[0_0_18px_rgba(240,174,85,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.2]" />
                  <span>ارسال پیام</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
