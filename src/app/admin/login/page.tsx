"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
        toast.error((j as { error?: string }).error || "Login failed");
        return;
      }
      toast.success("Signed in");
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-xl font-bold text-foreground">Budapest Night Admin</h1>
        <p className="text-sm text-muted-foreground">
          Use the value of <code className="rounded bg-muted px-1 font-mono text-xs">ADMIN_PASSWORD</code> from{" "}
          <code className="font-mono text-xs">.env</code> or <code className="font-mono text-xs">.env.local</code> locally, or from
          your host&apos;s environment (e.g. Vercel). <code className="font-mono text-xs">.env.example</code> is not loaded by the app.
          For local dev, run <code className="font-mono text-xs">npm run env:generate</code> to write a strong password into{" "}
          <code className="font-mono text-xs">.env.local</code>.
        </p>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-11"
        />
        <Button type="submit" className="w-full" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <Link href="/" className="block text-center text-sm text-teal hover:underline">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}
