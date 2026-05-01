/**
 * src/services/items.service.ts
 * Matched to real backend:
 *
 *  GET    /items               → { items: Item[], pagination: { total, page, limit, pages } }
 *  GET    /items/:id           → { item: Item }
 *  GET    /items/:id/matches   → { matches: Match[] }
 *  POST   /items/lost          → { message, item }   (multipart/form-data)
 *  POST   /items/found         → { message, item }   (multipart/form-data)
 *  PATCH  /items/:id           → { message, item }   (multipart/form-data)
 *  DELETE /items/:id           → { message }
 *
 * Backend DB columns: type (not status for lost/found), status=active|pending|claimed|resolved
 * Query params: type, category, location, status, search, page, limit
 */
import { axiosClient } from "@/lib/axios";
import type { Item, Category } from "@/lib/types";

// ─── Real backend item shape (from DB) ───────────────────────────────────────
export interface BackendItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  type: "lost" | "found";          // backend uses 'type', not 'status' for lost/found
  location: string;
  date: string;
  image_url: string | null;
  user_id: string;
  status: "active" | "pending" | "claimed" | "resolved";
  created_at: string;
  users?: { id: string; name: string; email?: string };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ItemsResponse {
  items: BackendItem[];
  pagination: Pagination;
}

export interface ItemResponse {
  item: BackendItem;
}

export interface ItemsQuery {
  type?: "lost" | "found";
  category?: Category;
  location?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReportItemPayload {
  title: string;
  description: string;
  category: Category;
  location: string;
  date: string;
  image?: File | null;
}

export interface Match {
  item: BackendItem;
  score: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function adaptBackendItem(b: BackendItem): Item {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    category: b.category,
    location: b.location,
    date: b.date,
    image: b.image_url ?? "",
    status: b.type,                         // map type → status for UI
    reportedBy: b.user_id,
    reporterName: b.users?.name ?? "Unknown",
    createdAt: b.created_at,
  };
}

function buildFormData(payload: ReportItemPayload): FormData {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("description", payload.description);
  form.append("category", payload.category);
  form.append("location", payload.location);
  form.append("date", payload.date);
  if (payload.image) form.append("image", payload.image);
  return form;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const itemsService = {
  /** GET /items */
  list: async (query: ItemsQuery = {}): Promise<ItemsResponse> => {
    const { data } = await axiosClient.get<ItemsResponse>("/items", { params: query });
    return data;
  },

  /** GET /items/:id */
  get: async (id: string): Promise<BackendItem> => {
    const { data } = await axiosClient.get<ItemResponse>(`/items/${id}`);
    return data.item;
  },

  /** GET /items/:id/matches */
  getMatches: async (id: string): Promise<Match[]> => {
    const { data } = await axiosClient.get<{ matches: Match[] }>(`/items/${id}/matches`);
    return data.matches;
  },

  /** POST /items/lost */
  reportLost: async (payload: ReportItemPayload): Promise<BackendItem> => {
    const form = buildFormData(payload);
    const { data } = await axiosClient.post<{ message: string; item: BackendItem }>("/items/lost", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.item;
  },

  /** POST /items/found */
  reportFound: async (payload: ReportItemPayload): Promise<BackendItem> => {
    const form = buildFormData(payload);
    const { data } = await axiosClient.post<{ message: string; item: BackendItem }>("/items/found", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.item;
  },

  /** PATCH /items/:id */
  update: async (id: string, payload: Partial<ReportItemPayload>): Promise<BackendItem> => {
    const form = buildFormData(payload as ReportItemPayload);
    const { data } = await axiosClient.patch<{ message: string; item: BackendItem }>(`/items/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.item;
  },

  /** DELETE /items/:id */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/items/${id}`);
  },
};
