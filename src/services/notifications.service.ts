/**
 * src/services/notifications.service.ts
 * Matched to real backend:
 *
 *  GET   /notifications           → { notifications: Notification[], unread_count: number }
 *  PATCH /notifications/:id/read  → { message }
 *  PATCH /notifications/read-all  → { message }
 */
import { axiosClient } from "@/lib/axios";

export interface BackendNotification {
  id: string;
  user_id: string;
  type: "match" | "claim_request" | "claim_accepted" | "claim_rejected" | "system";
  title: string;
  body: string;
  is_read: boolean;           // backend uses is_read (not read)
  link?: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: BackendNotification[];
  unread_count: number;
}

export const notificationsService = {
  /** GET /notifications */
  list: async (): Promise<NotificationsResponse> => {
    const { data } = await axiosClient.get<NotificationsResponse>("/notifications");
    return data;
  },

  /** PATCH /notifications/:id/read */
  markRead: async (id: string): Promise<void> => {
    await axiosClient.patch(`/notifications/${id}/read`);
  },

  /** PATCH /notifications/read-all */
  markAllRead: async (): Promise<void> => {
    await axiosClient.patch("/notifications/read-all");
  },
};
