import { Suspense } from "react";
import { Center, Loader } from "@mantine/core";
import BudapestNightShell from "@/components/scout/BudapestNightShell";

function AppLoading() {
  return (
    <Center mih="100vh">
      <Loader color="brand" type="dots" aria-label="Loading" />
    </Center>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <BudapestNightShell />
    </Suspense>
  );
}
