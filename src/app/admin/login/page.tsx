"use client";

import { Anchor, Code, PasswordInput, Stack, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppButton, AuthShell } from "@/components/gds";
import { notify } from "@/lib/notify";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const login = async () => {
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login();
  };

  return (
    <Stack mih="100vh" align="center" justify="center" px="md" bg="var(--mantine-color-gray-light)">
      <AuthShell
        title="Pesti Est Admin"
        description={
          <Text size="sm" c="dimmed" ta="left">
            Use the value of <Code>ADMIN_PASSWORD</Code> from <Code>.env</Code> or{" "}
            <Code>.env.local</Code> locally, or from your host&apos;s environment (e.g. Vercel).{" "}
            <Code>.env.example</Code> is not loaded by the app. For local dev, run{" "}
            <Code>npm run env:generate</Code> to write a strong password into <Code>.env.local</Code>.
          </Text>
        }
        footer={
          <Anchor component={Link} href="/" size="sm">
            ← Back to site
          </Anchor>
        }
      >
        <Stack component="form" onSubmit={submit} gap="md">
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
            Sign in
          </AppButton>
        </Stack>
      </AuthShell>
    </Stack>
  );
}
