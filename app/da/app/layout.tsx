import { Suspense } from "react";
import AppShell from "../../../components/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loader…</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}