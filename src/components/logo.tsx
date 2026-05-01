import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

export function Logo({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-emerald shadow-elegant">
        <Search className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full gradient-gold ring-2 ring-background" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Lost<span className="text-gradient-gold">Link</span>
      </span>
    </Link>
  );
}
