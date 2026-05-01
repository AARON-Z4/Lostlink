/**
 * src/hooks/useNotifications.ts
 * React Query hooks for the real /notifications backend.
 *
 *  GET   /notifications           → { notifications, unread_count }
 *  PATCH /notifications/:id/read  → mark one read
 *  PATCH /notifications/read-all  → mark all read
 *
 * Backend uses is_read (not read). Adapted to frontend Notification type.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService, type BackendNotification } from "@/services/notifications.service";
import { useData } from "@/lib/store";
import type { Notification } from "@/lib/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const notifKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
};

function adaptNotification(b: BackendNotification): Notification {
  return {
    id: b.id,
    type: b.type === "claim_request" ? "claim_update"
        : b.type === "claim_accepted" ? "claim_update"
        : b.type === "claim_rejected" ? "claim_update"
        : b.type === "match" ? "match"
        : "system",
    title: b.title,
    body: b.body,
    read: b.is_read,               // map is_read → read
    createdAt: b.created_at,
    link: b.link,
  };
}

// ─── List notifications ───────────────────────────────────────────────────────
export function useNotifications() {
  const storeNotifs = useData((s) => s.notifications);
  const setNotifications = useData((s) => s.setNotifications);

  return useQuery({
    queryKey: notifKeys.list(),
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          notifications: storeNotifs,
          unread_count: storeNotifs.filter((n) => !n.read).length,
        };
      }
      const res = await notificationsService.list();
      const adapted = res.notifications.map(adaptNotification);
      setNotifications(adapted);
      return { notifications: adapted, unread_count: res.unread_count };
    },
    staleTime: 15_000,
    refetchInterval: 30_000,  // poll every 30s for new notifications
  });
}

// ─── Mark one as read ─────────────────────────────────────────────────────────
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const markRead = useData((s) => s.markNotificationRead);

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { markRead(id); return; }
      return notificationsService.markRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.all }),
  });
}

// ─── Mark all as read ─────────────────────────────────────────────────────────
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const markAll = useData((s) => s.markAllRead);

  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK) { markAll(); return; }
      return notificationsService.markAllRead();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notifKeys.all }),
  });
}
