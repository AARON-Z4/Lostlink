import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Search, PlusCircle, Inbox, Bell, QrCode, Shield, Settings, FileSearch, Hand,
} from "lucide-react";
import { useAuth } from "@/lib/store";

const groups = [
  {
    label: "Dashboard",
    items: [
      { to: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
      { to: "/dashboard/lost-items", label: "My Lost", icon: FileSearch },
      { to: "/dashboard/found-items", label: "My Found", icon: Inbox },
      { to: "/dashboard/claims", label: "Claims", icon: Hand },
      { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Report",
    items: [
      { to: "/report/lost", label: "Report Lost", icon: PlusCircle },
      { to: "/report/found", label: "Report Found", icon: PlusCircle },
    ],
  },
  {
    label: "Discover",
    items: [
      { to: "/items/browse", label: "Browse Items", icon: Search },
      { to: "/qr/generate", label: "QR Tags", icon: QrCode },
    ],
  },
] as const;

const adminItems = [
  { to: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
  { to: "/admin/users", label: "Users", icon: Shield },
  { to: "/admin/items", label: "Items", icon: Shield },
  { to: "/admin/claims", label: "Claims", icon: Shield },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  const Item = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = path === to || path.startsWith(to + "/");
    return (
      <Link
        to={to}
        onClick={onNavigate}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold-glow"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold">
            <Search className="h-4 w-4 text-gold-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold">
            Lost<span className="text-sidebar-primary">Link</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{g.label}</p>
            <div className="space-y-1">
              {g.items.map((it) => <Item key={it.to} {...it} />)}
            </div>
          </div>
        ))}
        {user?.role === "admin" && (
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Admin</p>
            <div className="space-y-1">{adminItems.map((it) => <Item key={it.to} {...it} />)}</div>
          </div>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/profile/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          <Settings className="h-4 w-4" />Settings
        </Link>
      </div>
    </aside>
  );
}
