import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/auth")({ component: AuthLayout });

function AuthLayout() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden md:block overflow-hidden gradient-emerald text-primary-foreground">
        <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-gold/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Every lost thing has a story.<br />
              <span className="text-gradient-gold">We help write the ending.</span>
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands using LostLink to reunite people with what matters.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} LostLink</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4 md:hidden">
          <Logo />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
