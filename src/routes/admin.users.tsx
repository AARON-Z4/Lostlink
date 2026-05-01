/**
 * src/routes/admin.users.tsx
 * Updated: uses real adminService.listUsers() with loading/error states.
 * Also shows role update and delete buttons for admin.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function AdminUsers() {
  const qc = useQueryClient();

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      return adminService.listUsers();
    },
    staleTime: 60_000,
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "user" | "admin" }): Promise<void> => {
      if (USE_MOCK) return;
      await adminService.updateUserRole(id, role);
    },
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: () => toast.error("Failed to update role"),
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: string) => USE_MOCK ? Promise.resolve() : adminService.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: () => toast.error("Failed to delete user"),
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description={`Manage platform users${users.length ? ` — ${users.length} total` : ""}.`}
      />
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load users. Check your connection.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-emerald text-xs font-semibold text-primary-foreground">
                      {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                    <span className="font-medium">{u.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.role === "admin" ? "border-gold/40 bg-gold/15 text-gold-foreground" : ""}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => updateRole({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}
                    >
                      {u.role === "admin" ? "Demote" : "Make admin"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
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
