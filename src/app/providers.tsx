"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineRoot } from "@/components/mantine/MantineRoot";
import { DisplayCurrencyProvider } from "@/contexts/DisplayCurrencyContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DisplayCurrencyProvider>
        <MantineRoot>{children}</MantineRoot>
      </DisplayCurrencyProvider>
    </QueryClientProvider>
  );
}
