/**
 * src/services/admin.service.ts
 * Matched to real backend admin routes (all require admin role):
 *
 *  GET    /admin/stats            → stats object
 *  GET    /admin/users            → { users: User[] }  (or array)
 *  PATCH  /admin/users/:id/role   → updated user
 *  DELETE /admin/users/:id        → { message }
 *  GET    /admin/items            → { items, pagination }
 *  DELETE /admin/items/:id        → { message }
 *  GET    /admin/claims           → { claims }
 *  PATCH  /admin/claims/:id       → updated claim
 */
import { axiosClient } from "@/lib/axios";
import type { BackendItem } from "./items.service";
import type { BackendClaim } from "./claims.service";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at?: string;
}

export interface AdminStats {
  total_users: number;
  total_items: number;
  total_claims: number;
  active_items: number;
  resolved_items: number;
}

export const adminService = {
  /** GET /admin/stats */
  getStats: async (): Promise<AdminStats> => {
    const { data } = await axiosClient.get<AdminStats>("/admin/stats");
    return data;
  },

  /** GET /admin/users */
  listUsers: async (): Promise<AdminUser[]> => {
    const { data } = await axiosClient.get<AdminUser[] | { users: AdminUser[] }>("/admin/users");
    return Array.isArray(data) ? data : data.users;
  },

  /** PATCH /admin/users/:id/role */
  updateUserRole: async (id: string, role: "user" | "admin"): Promise<AdminUser> => {
    const { data } = await axiosClient.patch<AdminUser>(`/admin/users/${id}/role`, { role });
    return data;
  },

  /** DELETE /admin/users/:id */
  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/users/${id}`);
  },

  /** GET /admin/items */
  listItems: async (): Promise<BackendItem[]> => {
    const { data } = await axiosClient.get<{ items: BackendItem[] }>("/admin/items");
    return data.items;
  },

  /** DELETE /admin/items/:id */
  deleteItem: async (id: string): Promise<void> => {
    await axiosClient.delete(`/admin/items/${id}`);
  },

  /** PATCH /items/:id (as admin) */
  updateItem: async (id: string, payload: Record<string, any>): Promise<BackendItem> => {
    const { data } = await axiosClient.patch<{ item: BackendItem }>(`/items/${id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data.item;
  },

  /** GET /admin/claims */
  listClaims: async (): Promise<BackendClaim[]> => {
    const { data } = await axiosClient.get<{ claims: BackendClaim[] }>("/admin/claims");
    return data.claims;
  },

  /** PATCH /admin/claims/:id */
  updateClaim: async (id: string, status: string): Promise<BackendClaim> => {
    const { data } = await axiosClient.patch<BackendClaim>(`/admin/claims/${id}`, { status });
    return data;
  },
};
