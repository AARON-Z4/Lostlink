/**
 * src/lib/store.ts
 * Zustand auth + data stores matched to real backend.
 *
 * Key differences from mock:
 *  - Token stored as access_token from backend (not "token")
 *  - refresh_token also stored for session renewal
 *  - login/register call real authService → { user, access_token, refresh_token }
 *  - Data state is seeded from mock for offline dev; replaced by React Query in live mode
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, Claim, Notification, User, ItemStatus, ClaimStatus } from "./types";
import { authService } from "@/services/auth.service";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;          // access_token (Supabase JWT)
  refreshToken: string | null;   // refresh_token
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      login: async (email, password) => {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          const user: User = { id: "u1", name: "Demo User", email, role: "user" };
          set({ user, token: "mock-jwt-" + user.id, refreshToken: null });
          return user;
        }

        const res = await authService.login({ email, password });
        set({ user: res.user, token: res.access_token, refreshToken: res.refresh_token });
        return res.user;
      },

      register: async (name, email, password) => {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 500));
          const user: User = { id: "u" + Date.now(), name, email, role: "user" };
          set({ user, token: "mock-jwt-" + user.id, refreshToken: null });
          return user;
        }

        const res = await authService.register({ name, email, password });
        set({ user: res.user, token: res.access_token, refreshToken: res.refresh_token });
        return res.user;
      },

      logout: () => {
        if (!USE_MOCK) authService.logout().catch(() => {});
        set({ user: null, token: null, refreshToken: null });
      },

      refreshUser: async () => {
        if (USE_MOCK || !get().token) return;
        try {
          const user = await authService.me();
          set({ user });
        } catch {
          // Try refresh token if access token expired
          const rt = get().refreshToken;
          if (rt) {
            try {
              const res = await authService.refresh(rt);
              set({ token: res.access_token, refreshToken: res.refresh_token });
            } catch {
              set({ user: null, token: null, refreshToken: null });
            }
          } else {
            set({ user: null, token: null, refreshToken: null });
          }
        }
      },
    }),
    { name: "lostlink-auth-v2" },
  ),
);

// ─── Data Store ───────────────────────────────────────────────────────────────
// Used in mock mode + as optimistic cache when using React Query in live mode.
interface DataState {
  items: Item[];
  claims: Claim[];
  notifications: Notification[];
  addItem: (item: Omit<Item, "id" | "createdAt">) => Item;
  updateItemStatus: (id: string, status: ItemStatus) => void;
  deleteItem: (id: string) => void;
  addClaim: (claim: Omit<Claim, "id" | "createdAt" | "status">) => Claim;
  updateClaimStatus: (id: string, status: ClaimStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setItems: (items: Item[]) => void;
  setClaims: (claims: Claim[]) => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      items: [],
      claims: [],
      notifications: [],

      setItems: (items) => set({ items }),
      setClaims: (claims) => set({ claims }),
      setNotifications: (notifications) => set({ notifications }),

      addItem: (item) => {
        const newItem: Item = { ...item, id: "i" + Date.now(), createdAt: new Date().toISOString() };
        set({ items: [newItem, ...get().items] });
        return newItem;
      },
      updateItemStatus: (id, status) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, status } : i)) }),
      deleteItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      addClaim: (claim) => {
        const newClaim: Claim = {
          ...claim,
          id: "c" + Date.now(),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        set({
          claims: [newClaim, ...get().claims],
          notifications: [
            {
              id: "n" + Date.now(),
              type: "claim_update",
              title: "Claim submitted",
              body: `Your claim on "${claim.itemTitle}" is pending.`,
              read: false,
              createdAt: new Date().toISOString(),
              link: "/dashboard/claims",
            },
            ...get().notifications,
          ],
        });
        return newClaim;
      },

      updateClaimStatus: (id, status) =>
        set({
          claims: get().claims.map((c) => (c.id === id ? { ...c, status } : c)),
          notifications: [
            {
              id: "n" + Date.now(),
              type: "claim_update",
              title: status === "approved" ? "Claim approved" : "Claim rejected",
              body: `A claim was ${status}.`,
              read: false,
              createdAt: new Date().toISOString(),
              link: "/dashboard/claims",
            },
            ...get().notifications,
          ],
        }),

      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }),
      markAllRead: () =>
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),
    }),
    { name: "lostlink-data-v2" },
  ),
);

// ─── Match scoring ────────────────────────────────────────────────────────────
export function computeMatches(target: Item, all: Item[]) {
  const opposite: ItemStatus = target.status === "lost" ? "found" : "lost";
  return all
    .filter((i) => i.id !== target.id && i.status === opposite)
    .map((i) => {
      let score = 0;
      if (i.category === target.category) score += 50;
      const tWords = target.title.toLowerCase().split(/\s+/);
      const iWords = i.title.toLowerCase().split(/\s+/);
      score += tWords.filter((w) => iWords.includes(w)).length * 12;
      if (i.location.split(",")[0] === target.location.split(",")[0]) score += 20;
      const dDiff =
        Math.abs(new Date(i.date).getTime() - new Date(target.date).getTime()) / 86400000;
      score += Math.max(0, 20 - dDiff * 3);
      return { item: i, score: Math.min(100, Math.round(score)) };
    })
    .filter((m) => m.score > 25)
    .sort((a, b) => b.score - a.score);
}
