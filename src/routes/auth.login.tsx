/**
 * src/routes/auth.login.tsx — wired to real backend via useAuth hook
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { extractApiError } from "@/lib/axios";

export const Route = createFileRoute("/auth/login")({ component: Login });

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@lostlink.app");
  const [password, setPassword] = useState("demo");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate({ to: "/dashboard/overview" });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard/overview" });
    } catch (err) {
      const { message } = extractApiError(err);
      toast.error(message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to LostLink.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="premium" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/auth/register" className="font-medium text-accent hover:underline">Create an account</Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Demo: any email works. Use <code className="rounded bg-muted px-1">admin@lostlink.app</code> for admin.
      </p>
    </div>
  );
}
