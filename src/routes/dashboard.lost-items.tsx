/**
 * src/routes/dashboard.lost-items.tsx
 * Wired to useItems hook; filters by type=lost and current user.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useItems } from "@/hooks/useItems";
import { ItemCard } from "@/components/item-card";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSearch } from "lucide-react";

export const Route = createFileRoute("/dashboard/lost-items")({ component: LostItems });

function LostItems() {
  const { user } = useAuth();
  const { data, isLoading } = useItems({ type: "lost" });
  const items = (data?.items ?? []).filter((i) => i.reportedBy === user?.id);

  return (
    <div>
      <PageHeader
        title="My lost items"
        description="Items you've reported as lost."
        actions={<Button variant="premium" asChild><Link to="/report/lost">Report lost</Link></Button>}
      />
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No lost items yet"
          description="When you report a lost item it'll appear here."
          action={<Button variant="premium" asChild><Link to="/report/lost">Report lost item</Link></Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ItemCard key={i.id} item={i} />)}
        </div>
      )}
    </div>
  );
}
