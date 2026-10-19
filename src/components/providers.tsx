"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import React, { useState } from "react";

import { CurrencyProvider } from "@/components/currency-provider";
import { AuthProvider } from "@/components/auth-provider";
import { ToastProvider } from "@/components/toast-provider";
import { ConfirmModalProvider } from "@/components/confirm-modal-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <ToastProvider>
              <ConfirmModalProvider>{children}</ConfirmModalProvider>
            </ToastProvider>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
