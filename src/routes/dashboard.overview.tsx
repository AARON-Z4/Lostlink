/**
 * src/routes/dashboard.overview.tsx
 * Wired to real hooks: useItems, useClaims, useNotifications.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { useClaims } from "@/hooks/useClaims";
import { useNotifications } from "@/hooks/useNotifications";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/item-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSearch, Inbox, Hand, Bell, ArrowUpRight, PlusCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/overview")({ component: Overview });

function Overview() {
  const { user } = useAuth();
  const { data: itemsData, isLoading: itemsLoading } = useItems();
  const { data: claimsData } = useClaims();
  const { data: notifData } = useNotifications();

  const items = itemsData?.items ?? [];
  const allClaims = [...(claimsData?.mine ?? []), ...(claimsData?.incoming ?? [])];
  const notifications = notifData?.notifications ?? [];

  const myLost   = items.filter((i) => i.reportedBy === user?.id && i.status === "lost");
  const myFound  = items.filter((i) => i.reportedBy === user?.id && i.status === "found");
  const myClaims = (claimsData?.mine ?? []);
  const unread   = notifData?.unread_count ?? notifications.filter((n) => !n.read).length;

  const stats = [
    { label: "Lost reports",   value: myLost.length,    icon: FileSearch, to: "/dashboard/lost-items",    tone: "from-primary to-accent"  },
    { label: "Found reports",  value: myFound.length,   icon: Inbox,      to: "/dashboard/found-items",   tone: "from-accent to-primary"  },
    { label: "Active claims",  value: myClaims.length,  icon: Hand,       to: "/dashboard/claims",        tone: "from-gold to-primary"    },
    { label: "Notifications",  value: unread,           icon: Bell,       to: "/dashboard/notifications", tone: "from-primary to-gold"    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome${user ? ", " + user.name.split(" ")[0] : ""}.`}
        description="Your lost & found activity at a glance."
        actions={
          <>
            <Button variant="premium" asChild><Link to="/report/lost"><PlusCircle className="mr-2 h-4 w-4" />Report lost</Link></Button>
            <Button variant="outline" asChild><Link to="/report/found">Report found</Link></Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="group relative overflow-hidden p-5 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${s.tone} opacity-15 blur-2xl`} />
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-emerald">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-6 font-display text-3xl font-semibold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Recent items in the community</h2>
          <Link to="/items/browse" className="text-sm text-accent hover:underline">Browse all →</Link>
        </div>
        {itemsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.slice(0, 4).map((i) => <ItemCard key={i.id} item={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
