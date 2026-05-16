import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BudapestNightShell from "@/components/scout/BudapestNightShell";

function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <BudapestNightShell />
    </Suspense>
  );
}
