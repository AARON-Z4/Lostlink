import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const u = useAuth.getState().user;
    if (!u) throw redirect({ to: "/auth/login" });
    if (u.role !== "admin") throw redirect({ to: "/dashboard/overview" });
  },
  component: () => <AppShell><Outlet /></AppShell>,
});
