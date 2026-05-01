/**
 * src/routes/auth.register.tsx — wired to real backend via useAuth hook
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { extractApiError } from "@/lib/axios";

export const Route = createFileRoute("/auth/register")({ component: Register });

function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate({ to: "/dashboard/overview" });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success("Account created");
      navigate({ to: "/dashboard/overview" });
    } catch (err) {
      const { message } = extractApiError(err);
      toast.error(message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">It takes less than a minute.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="premium" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Have an account? <Link to="/auth/login" className="font-medium text-accent hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
