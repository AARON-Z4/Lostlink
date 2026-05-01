/**
 * src/routes/dashboard.claims.tsx
 * Updated to use useClaims + useUpdateClaimStatus React Query hooks.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useClaims, useUpdateClaimStatus } from "@/hooks/useClaims";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Hand, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Claim } from "@/lib/types";

export const Route = createFileRoute("/dashboard/claims")({ component: Claims });

const statusBadge: Record<string, string> = {
  pending: "bg-gold/20 text-gold-foreground border-gold/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function Claims() {
  const { data, isLoading } = useClaims();
  const { mutate: updateStatus, isPending } = useUpdateClaimStatus();

  const mine: Claim[] = data?.mine ?? [];
  const incoming: Claim[] = data?.incoming ?? [];

  const handleStatus = (id: string, status: "approved" | "rejected") => {
    updateStatus(
      { id, status },
      {
        onSuccess: () => toast.success(status === "approved" ? "Claim approved" : "Claim rejected"),
        onError: () => toast.error("Could not update claim"),
      },
    );
  };

  if (isLoading) return <ClaimsSkeleton />;

  const Block = ({
    title,
    list,
    isIncoming = false,
  }: {
    title: string;
    list: Claim[];
    isIncoming?: boolean;
  }) => (
    <div className="mb-10">
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      {list.length === 0 ? (
        <EmptyState
          icon={Hand}
          title="Nothing here yet"
          description={
            isIncoming
              ? "When others claim your found items, they'll show up here."
              : "Claim an item to see its status here."
          }
        />
      ) : (
        <div className="grid gap-4">
          {list.map((c) => (
            <Card key={c.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Link to="/items/$id" params={{ id: c.itemId }} className="shrink-0">
                <img src={c.itemImage} alt={c.itemTitle} className="h-20 w-20 rounded-lg object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to="/items/$id" params={{ id: c.itemId }} className="font-medium hover:underline">
                    {c.itemTitle}
                  </Link>
                  <Badge variant="outline" className={`capitalize ${statusBadge[c.status]}`}>
                    {c.status}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">"{c.message}"</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isIncoming ? `From ${c.claimantName} · ` : ""}
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isIncoming && c.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="premium"
                    disabled={isPending}
                    onClick={() => handleStatus(c.id, "approved")}
                  >
                    <Check className="mr-1 h-3 w-3" />Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleStatus(c.id, "rejected")}
                  >
                    <X className="mr-1 h-3 w-3" />Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Claims" description="Manage claims you've made and incoming requests on your found items." />
      <Block title="Incoming claims" list={incoming} isIncoming />
      <Block title="My claims" list={mine} />
    </div>
  );
}

function ClaimsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
