import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, User as UserIcon, Settings, LayoutDashboard } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useAuth, useData } from "@/lib/store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

export function Navbar({ onMenu }: { onMenu?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notifications = useData((s) => s.notifications);
  const markRead = useData((s) => s.markNotificationRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {onMenu && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu}>
            <Menu />
          </Button>
        )}
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          {!user ? (
            <>
              <Button variant="ghost" asChild><Link to="/auth/login">Sign in</Link></Button>
              <Button variant="premium" asChild><Link to="/auth/register">Get started</Link></Button>
            </>
          ) : (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {unread > 0 && (
                      <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
                        {unread}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <p className="font-medium">Notifications</p>
                    <Link to="/dashboard/notifications" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => { markRead(n.id); if (n.link) navigate({ to: n.link }); }}
                        className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60 ${!n.read ? "bg-muted/30" : ""}`}
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-gold" : "bg-transparent"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{n.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                        </div>
                      </button>
                    ))}
                    {notifications.length === 0 && (
                      <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-emerald text-xs font-semibold text-primary-foreground">
                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard/overview"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/profile/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild><Link to="/admin/dashboard"><UserIcon className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
                    <LogOut className="mr-2 h-4 w-4" />Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
