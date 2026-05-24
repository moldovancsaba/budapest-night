"use client";

import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <ActionIcon variant="default" size="lg" radius="xl" className={className} aria-hidden />;
  }

  const isDark = colorScheme === "dark";

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="xl"
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </ActionIcon>
  );
}
