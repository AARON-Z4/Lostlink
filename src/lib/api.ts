/**
 * src/lib/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Backwards-compatible re-export for components that import from "@/lib/api".
 *
 * • MOCK mode  → reads directly from Zustand store (no network calls)
 * • LIVE mode  → delegates to the typed service layer in src/services/
 *
 * This file keeps all existing component imports working without any changes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export { axiosClient as api } from "./axios";
export { itemsService as itemsApi } from "@/services/items.service";
export { claimsService as claimsApi } from "@/services/claims.service";
