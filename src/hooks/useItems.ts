/**
 * src/hooks/useItems.ts
 * React Query hooks matched to real backend response shapes.
 *
 * Real shapes:
 *  - GET /items    → { items: BackendItem[], pagination }
 *  - GET /items/:id → { item: BackendItem }
 *  - POST /items/lost|found → { message, item: BackendItem }
 *  - adaptBackendItem() converts DB columns → frontend Item type
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  itemsService,
  adaptBackendItem,
  type ItemsQuery,
  type ReportItemPayload,
  type BackendItem,
} from "@/services/items.service";
import { useData } from "@/lib/store";
import type { Item } from "@/lib/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const itemKeys = {
  all: ["items"] as const,
  list: (q: ItemsQuery) => ["items", "list", q] as const,
  detail: (id: string) => ["items", "detail", id] as const,
  matches: (id: string) => ["items", "matches", id] as const,
};

// ─── List items ───────────────────────────────────────────────────────────────
export function useItems(query: ItemsQuery = {}) {
  const storeItems = useData((s) => s.items);
  const setItems = useData((s) => s.setItems);

  return useQuery({
    queryKey: itemKeys.list(query),
    queryFn: async () => {
      if (USE_MOCK) {
        return { items: storeItems, pagination: { total: storeItems.length, page: 1, limit: 50, pages: 1 } };
      }
      const res = await itemsService.list(query);
      const adapted = res.items.map(adaptBackendItem);
      setItems(adapted);
      return { items: adapted, pagination: res.pagination };
    },
    staleTime: 30_000,
  });
}

// ─── Single item ──────────────────────────────────────────────────────────────
export function useItem(id: string) {
  const storeItem = useData((s) => s.items.find((i) => i.id === id));
  const setItems = useData((s) => s.setItems);
  const items = useData((s) => s.items);

  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: async (): Promise<Item | null> => {
      if (USE_MOCK) return storeItem ?? null;
      const backend = await itemsService.get(id);
      const adapted = adaptBackendItem(backend);
      // Update store cache
      setItems(items.map((i) => (i.id === id ? adapted : i)));
      return adapted;
    },
    enabled: !!id,
    staleTime: 60_000,
    initialData: storeItem,
  });
}

// ─── Item matches from backend ────────────────────────────────────────────────
export function useItemMatches(id: string, enabled = true) {
  const allItems = useData((s) => s.items);

  return useQuery({
    queryKey: itemKeys.matches(id),
    queryFn: async () => {
      if (USE_MOCK) {
        // Use local scoring in mock mode
        const { computeMatches } = await import("@/lib/store");
        const target = allItems.find((i) => i.id === id);
        if (!target) return [];
        return computeMatches(target, allItems).map((m) => ({
          item: m.item,
          score: m.score,
        }));
      }
      return itemsService.getMatches(id);
    },
    enabled: !!id && enabled,
    staleTime: 120_000,
  });
}

// ─── Report lost ──────────────────────────────────────────────────────────────
export function useReportLost() {
  const qc = useQueryClient();
  const addItem = useData((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: ReportItemPayload): Promise<Item> => {
      if (USE_MOCK) {
        return addItem({
          title: payload.title,
          description: payload.description,
          category: payload.category,
          location: payload.location,
          date: payload.date,
          image: payload.image instanceof File ? URL.createObjectURL(payload.image) : payload.image ?? "",
          status: "lost",
          reportedBy: "u1",
          reporterName: "You",
        });
      }
      const backend = await itemsService.reportLost(payload);
      return adaptBackendItem(backend);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}

// ─── Report found ─────────────────────────────────────────────────────────────
export function useReportFound() {
  const qc = useQueryClient();
  const addItem = useData((s) => s.addItem);

  return useMutation({
    mutationFn: async (payload: ReportItemPayload): Promise<Item> => {
      if (USE_MOCK) {
        return addItem({
          title: payload.title,
          description: payload.description,
          category: payload.category,
          location: payload.location,
          date: payload.date,
          image: payload.image instanceof File ? URL.createObjectURL(payload.image) : payload.image ?? "",
          status: "found",
          reportedBy: "u1",
          reporterName: "You",
        });
      }
      const backend = await itemsService.reportFound(payload);
      return adaptBackendItem(backend);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}

// ─── Update item ──────────────────────────────────────────────────────────────
export function useUpdateItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ReportItemPayload>): Promise<Item | void> => {
      if (USE_MOCK) return;
      const backend = await itemsService.update(id, payload);
      return adaptBackendItem(backend);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}

// ─── Delete item (admin / owner) ──────────────────────────────────────────────
export function useDeleteItem() {
  const qc = useQueryClient();
  const deleteItem = useData((s) => s.deleteItem);

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) { deleteItem(id); return; }
      return itemsService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}
