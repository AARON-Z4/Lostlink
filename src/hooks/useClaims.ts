/**
 * src/hooks/useClaims.ts
 * React Query hooks matched to real backend:
 *
 *  POST /claims   body: { item_id, message }
 *  GET  /claims   → { claims: BackendClaim[] }  (flat — split in hook)
 *  PATCH /claims/:id  body: { status: "accepted" | "rejected" }
 *  PATCH /claims/:id/resolve
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { claimsService, type BackendClaim, type ClaimResolutionStatus } from "@/services/claims.service";
import { useData, useAuth } from "@/lib/store";
import type { Claim } from "@/lib/types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const claimKeys = {
  all: ["claims"] as const,
  list: () => ["claims", "list"] as const,
};

// ─── Adapt backend claim to frontend Claim type ───────────────────────────────
function adaptClaim(b: BackendClaim): Claim {
  return {
    id: b.id,
    itemId: b.item_id,
    itemTitle: b.items?.title ?? "",
    itemImage: b.items?.image_url ?? "",
    claimantId: b.claimant_id,
    claimantName: b.users?.name ?? "Unknown",
    ownerId: "",                         // not returned by backend list
    message: b.message,
    // Map "accepted" → "approved" for the UI (UI type uses approved/rejected)
    status: b.status === "accepted" ? "approved" : (b.status as "pending" | "approved" | "rejected"),
    createdAt: b.created_at,
  };
}

// ─── List claims (split into mine / incoming) ─────────────────────────────────
export function useClaims() {
  const user = useAuth((s) => s.user);
  const storeClaims = useData((s) => s.claims);

  return useQuery({
    queryKey: claimKeys.list(),
    queryFn: async () => {
      if (USE_MOCK) {
        return {
          mine: storeClaims.filter((c) => c.claimantId === user?.id),
          incoming: storeClaims.filter((c) => c.ownerId === user?.id),
          raw: storeClaims,
        };
      }
      const backendClaims = await claimsService.list();
      const adapted = backendClaims.map(adaptClaim);
      // Split: mine = I submitted; incoming = on my items (claimantId !== me)
      const mine = adapted.filter((c) => c.claimantId === user?.id);
      const incoming = adapted.filter((c) => c.claimantId !== user?.id);
      return { mine, incoming, raw: adapted };
    },
    enabled: !!user,
    staleTime: 20_000,
  });
}

// ─── Submit a claim ───────────────────────────────────────────────────────────
export function useSubmitClaim() {
  const qc = useQueryClient();
  const addClaim = useData((s) => s.addClaim);

  return useMutation({
    mutationFn: async (payload: {
      item_id: string;
      message: string;
      // Mock-only enrichment
      itemTitle?: string;
      itemImage?: string;
      claimantName?: string;
      ownerId?: string;
    }) => {
      if (USE_MOCK) {
        return addClaim({
          itemId: payload.item_id,
          itemTitle: payload.itemTitle ?? "",
          itemImage: payload.itemImage ?? "",
          claimantId: "u1",
          claimantName: payload.claimantName ?? "You",
          ownerId: payload.ownerId ?? "",
          message: payload.message,
        });
      }
      return claimsService.create({ item_id: payload.item_id, message: payload.message });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claimKeys.all }),
  });
}

// ─── Accept / reject a claim ──────────────────────────────────────────────────
export function useUpdateClaimStatus() {
  const qc = useQueryClient();
  const updateClaimStatus = useData((s) => s.updateClaimStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ClaimResolutionStatus | "approved" }) => {
      if (USE_MOCK) {
        // UI uses "approved"; map to mock store which also uses "approved"
        updateClaimStatus(id, status === "accepted" ? "approved" : (status as any));
        return;
      }
      // Real backend uses "accepted" / "rejected"
      const backendStatus: ClaimResolutionStatus = status === "approved" ? "accepted" : "rejected";
      return claimsService.updateStatus(id, backendStatus);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claimKeys.all }),
  });
}

// ─── Resolve a claim (mark fully returned) ────────────────────────────────────
export function useResolveClaim() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (USE_MOCK) return;
      return claimsService.resolve(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: claimKeys.all }),
  });
}
