/**
 * src/routes/dashboard.notifications.tsx
 * Updated to use useNotifications + useMarkAllNotificationsRead React Query hooks.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, Sparkles, Hand } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/notifications")({ component: Notifications });

const iconFor = { match: Sparkles, claim_update: Hand, system: Bell } as const;

function Notifications() {
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Match alerts, claim updates, and system messages."
        actions={
          <Button variant="outline" onClick={() => markAll()}>
            <Check className="mr-2 h-4 w-4" />Mark all read
          </Button>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New activity will show up here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconFor[n.type] ?? Bell;
            const inner = (
              <Card className={`flex items-start gap-4 p-4 transition-colors ${!n.read ? "bg-muted/30" : ""}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-emerald">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </Card>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => markRead(n.id)} className="block">{inner}</Link>
            ) : (
              <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">{inner}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}
