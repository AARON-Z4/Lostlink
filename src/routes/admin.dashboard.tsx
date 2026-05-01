/**
 * src/routes/admin.dashboard.tsx
 * Wired to real adminService.getStats() + live claims/items hooks.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Package, Hand, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      if (USE_MOCK) return { total_users: 3, total_items: 8, total_claims: 2, active_items: 5, resolved_items: 1 };
      return adminService.getStats();
    },
    staleTime: 30_000,
  });

  const statCards = [
    { label: "Users",         value: stats?.total_users   ?? 0, icon: Users,       to: "/admin/users"   },
    { label: "Items",         value: stats?.total_items   ?? 0, icon: Package,      to: "/admin/items"   },
    { label: "Claims",        value: stats?.total_claims  ?? 0, icon: Hand,         to: "/admin/claims"  },
    { label: "Active items",  value: stats?.active_items  ?? 0, icon: ShieldCheck,  to: "/admin/items"   },
  ];

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Operations overview for the platform." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
          : statCards.map((s) => (
              <Link key={s.label} to={s.to}>
                <Card className="group p-5 transition-all hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-gold">
                    <s.icon className="h-5 w-5 text-gold-foreground" />
                  </div>
                  <p className="mt-6 font-display text-3xl font-semibold">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
