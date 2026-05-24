"use client";

import { Anchor, Code, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppButton } from "@/components/mantine/AppButton";
import { notify } from "@/lib/notify";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        notify.error((j as { error?: string }).error || "Check your password and try again.", {
          title: "Login failed",
        });
        return;
      }
      notify.success("Redirecting to admin…", { title: "Signed in" });
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack mih="100vh" align="center" justify="center" px="md" bg="var(--mantine-color-gray-light)">
      <Paper component="form" onSubmit={submit} w="100%" maw={400} p="xl" radius="lg" withBorder>
        <Stack gap="md">
          <Title order={2} size="h3" tt="uppercase" lts="0.04em">
            Pesti Est Admin
          </Title>
          <Text size="sm" c="dimmed">
            Use the value of <Code>ADMIN_PASSWORD</Code> from <Code>.env</Code> or <Code>.env.local</Code> locally,
            or from your host&apos;s environment (e.g. Vercel). <Code>.env.example</Code> is not loaded by the app. For
            local dev, run <Code>npm run env:generate</Code> to write a strong password into <Code>.env.local</Code>.
          </Text>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            size="md"
            required
          />
          <AppButton type="submit" fullWidth loading={busy} disabled={!password}>
            {busy ? "Signing in…" : "Sign in"}
          </AppButton>
          <Anchor component={Link} href="/" size="sm" ta="center">
            ← Back to site
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
}
