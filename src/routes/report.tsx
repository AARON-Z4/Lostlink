import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/report")({
  beforeLoad: () => { if (!useAuth.getState().user) throw redirect({ to: "/auth/login" }); },
  component: () => <AppShell><Outlet /></AppShell>,
});
