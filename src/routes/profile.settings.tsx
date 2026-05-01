import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/settings")({ component: Settings });

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Manage your account preferences." />
      <Card className="p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="premium" onClick={() => toast.success("Profile saved")}>Save changes</Button>
        </div>
      </Card>

      <Card className="mt-6 border-destructive/30 p-6">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out of LostLink on this device.</p>
        <Button className="mt-4" variant="outline" onClick={() => { logout(); navigate({ to: "/" }); }}>Log out</Button>
      </Card>
    </div>
  );
}
