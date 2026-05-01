/**
 * src/routes/admin.items.tsx
 * Wired to real adminService.listItems() + useDeleteItem().
 */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useDeleteItem } from "@/hooks/useItems";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adaptBackendItem } from "@/services/items.service";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/items")({ component: AdminItems });

function AdminItems() {
  const qc = useQueryClient();

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "items"],
    queryFn: async () => {
      const backendItems = await adminService.listItems();
      return backendItems.map(adaptBackendItem);
    },
    staleTime: 30_000,
  });

  const { mutate: deleteItem, isPending } = useDeleteItem();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteItem(id, {
      onSuccess: () => { toast.success("Item deleted"); refetch(); },
      onError: () => toast.error("Failed to delete item"),
    });
  };

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      await adminService.updateItem(id, { type });
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "items"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <div>
      <PageHeader title="Items" description="Moderate items reported by users." />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load items.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="flex items-center gap-3">
                    {i.image && <img src={i.image} alt="" className="h-10 w-10 rounded-md object-cover" />}
                    <span className="font-medium">{i.title}</span>
                  </TableCell>
                  <TableCell>{i.category}</TableCell>
                  <TableCell className="text-muted-foreground">{i.reporterName}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{i.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      disabled={isUpdating}
                      onClick={() => updateStatus({ id: i.id, type: i.status === "lost" ? "found" : "lost" })}
                    >
                      Mark {i.status === "lost" ? "Found" : "Lost"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => handleDelete(i.id, i.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
