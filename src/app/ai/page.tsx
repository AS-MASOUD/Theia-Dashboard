"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  Send,
  ShieldCheck,
  User,
  Wrench,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { SafeMarkdown } from "@/components/safe-markdown";

const SUGGESTED_PROMPTS = [
  "وضعیت فعلی دارایی‌ها و ارزش خالص من را بررسی و خلاصه کن.",
  "بیشترین تمرکز سرمایه و ریسک پورتفوی من کجاست؟",
  "جریان نقدینگی و نرخ پس‌انداز ماهانه من را تحلیل کن.",
  "کدام بدهی‌ها و وام‌ها را باید در اولویت تسویه قرار دهم؟",
  "آیا ذخیره صندوق اضطراری و بافر نقدی من کافی است؟",
];

export default function AIAssistantPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      role: string;
      content: string;
      tool_calls?: Record<string, unknown>[] | Record<string, unknown> | null;
    }>
  >([
    {
      role: "assistant",
      content:
        "به هسته هوشمند مدیریت مالی شخصی خوش آمدید. من می‌توانم ارزش خالص دارایی‌ها، تمرکز ریسک سرمایه‌گذاری، ساختار اقساط بدهی و سناریوهای آینده مالی شما را با اتکا به موتور محاسباتی قطعی تحلیل کنم. امروز چطور می‌توانم کمکتان کنم؟",
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (text: string) => api.sendAIChat(text),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          tool_calls: data.tool_calls,
        },
      ]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputMessage("");
    chatMutation.mutate(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282A2F]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-[12px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#E8E8E8] tracking-tight">
              دستیار هوشمند و تحلیل‌گر مالی (AI)
            </h2>
          </div>
          <p className="text-xs text-[#9A9DA5] mt-1 pr-11">
            تحلیل هوشمند زبانی متصل به موتور محاسباتی و داده‌های حسابداری شما
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1D21] border border-[#282A2F] text-[#9A9DA5] text-xs font-medium self-start sm:self-center">
          <ShieldCheck className="h-3.5 w-3.5 text-[#76A98C]" />
          <span>گاردریل‌های محاسباتی قطعی</span>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-[10px] border border-[#282A2F] bg-[#1B1D21] hover:bg-[#222327] hover:border-[#32343A] text-[#9A9DA5] hover:text-[#E8E8E8] font-medium transition-colors shrink-0 active:scale-95 text-[11px] cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#141518] border border-[#282A2F] rounded-[22px] p-5 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex gap-3 text-xs ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="h-8 w-8 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-[16px] space-y-2 leading-relaxed ${
                  isUser
                    ? "bg-[#F0AE55] text-[#0D0E10] font-medium"
                    : "bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8]"
                }`}
              >
                {/* Tool trace tag */}
                {!isUser && msg.tool_calls && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[10px] font-mono font-medium bg-[#141518] text-[#F0AE55] border border-[#282A2F] mb-1">
                    <Wrench className="h-3 w-3 text-[#F0AE55]" />
                    <span>
                      فراخوانی ابزار محاسباتی: get_financial_overview()
                    </span>
                  </div>
                )}

                <div className="leading-relaxed text-xs">
                  <SafeMarkdown content={msg.content} />
                </div>
              </div>

              {isUser && (
                <div className="h-8 w-8 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#E8E8E8] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="flex gap-3 text-xs items-center text-[#9A9DA5]">
            <div className="h-8 w-8 rounded-[10px] bg-[#1B1D21] border border-[#282A2F] text-[#F0AE55] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 p-3.5 rounded-[16px] bg-[#1B1D21] border border-[#282A2F]">
              <Loader2 className="h-4 w-4 animate-spin text-[#F0AE55]" />
              <span>
                در حال فراخوانی مدل‌های حسابداری و پردازش پاسخ تحلیلی...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2.5"
      >
        <input
          type="text"
          placeholder="سؤال مالی خود را بپرسید، مثلاً: تحلیل جریان نقدینگی یا تمرکز پورتفوی..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-3 rounded-[14px] border border-[#282A2F] bg-[#1B1D21] text-[#E8E8E8] placeholder:text-[#696D77] text-xs focus:outline-none focus:border-[#F0AE55] focus:ring-1 focus:ring-[#F0AE55]/30 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || chatMutation.isPending}
          className="px-5 py-3 rounded-[14px] bg-[#F0AE55] hover:bg-[#F0AE55]/90 text-[#0D0E10] text-xs font-medium transition-colors active:scale-95 disabled:opacity-40 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>ارسال</span>
        </button>
      </form>
    </div>
  );
}
