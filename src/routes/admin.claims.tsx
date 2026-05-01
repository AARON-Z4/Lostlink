/**
 * src/routes/admin.claims.tsx
 * Wired to real adminService.listClaims() + updateClaim().
 * Backend status: "accepted"/"rejected" — mapped for display.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useData } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/claims")({ component: AdminClaims });

const statusBadge: Record<string, string> = {
  pending:  "border-gold/40 bg-gold/15 text-gold-foreground",
  accepted: "border-success/30 bg-success/15 text-success",
  approved: "border-success/30 bg-success/15 text-success",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

function AdminClaims() {
  const qc = useQueryClient();

  const { data: claims = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "claims"],
    queryFn: async () => {
      return adminService.listClaims();
    },
    staleTime: 20_000,
  });

  const { mutate: updateClaim, isPending } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return adminService.updateClaim(id, status);
    },
    onSuccess: (_, vars) => {
      toast.success(vars.status === "accepted" ? "Claim accepted" : "Claim rejected");
      qc.invalidateQueries({ queryKey: ["admin", "claims"] });
    },
    onError: () => toast.error("Failed to update claim"),
  });

  return (
    <div>
      <PageHeader title="Claims" description="Approve or reject claims across the platform." />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load claims.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="flex items-center gap-3">
                    {c.items?.image_url && (
                      <img src={c.items.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                    )}
                    <span className="font-medium">{c.items?.title ?? "—"}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.users?.name ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">"{c.message}"</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${statusBadge[c.status] ?? ""}`}>
                      {c.status === "accepted" ? "approved" : c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm" variant="premium" disabled={isPending}
                          onClick={() => updateClaim({ id: c.id, status: "accepted" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm" variant="outline" disabled={isPending}
                          onClick={() => updateClaim({ id: c.id, status: "rejected" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
