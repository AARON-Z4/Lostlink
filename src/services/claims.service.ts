/**
 * src/services/claims.service.ts
 * Matched to real backend:
 *
 *  POST  /claims           → { message, claim }    body: { item_id, message }
 *  GET   /claims           → { claims: Claim[] }   (flat — both mine & incoming)
 *  PATCH /claims/:id       → { message, claim }    body: { status: "accepted"|"rejected" }
 *  PATCH /claims/:id/resolve → { message }
 *
 * NOTE: Backend uses "accepted"/"rejected" NOT "approved"/"rejected"
 * NOTE: Backend uses item_id (snake_case) not itemId
 */
import { axiosClient } from "@/lib/axios";

// ─── Real backend claim shape ─────────────────────────────────────────────────
export interface BackendClaim {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  items?: {
    id: string;
    title: string;
    type: string;
    category: string;
    location: string;
    image_url: string | null;
  };
  users?: {  // claimant info
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateClaimPayload {
  item_id: string;
  message: string;
}

export type ClaimResolutionStatus = "accepted" | "rejected";

export const claimsService = {
  /** POST /claims */
  create: async (payload: CreateClaimPayload): Promise<BackendClaim> => {
    const { data } = await axiosClient.post<{ message: string; claim: BackendClaim }>("/claims", payload);
    return data.claim;
  },

  /** GET /claims  — returns flat array; UI splits into mine/incoming */
  list: async (item_id?: string): Promise<BackendClaim[]> => {
    const { data } = await axiosClient.get<{ claims: BackendClaim[] }>("/claims", {
      params: item_id ? { item_id } : undefined,
    });
    return data.claims;
  },

  /** PATCH /claims/:id — status: "accepted" | "rejected" */
  updateStatus: async (id: string, status: ClaimResolutionStatus): Promise<BackendClaim> => {
    const { data } = await axiosClient.patch<{ message: string; claim: BackendClaim }>(`/claims/${id}`, { status });
    return data.claim;
  },

  /** PATCH /claims/:id/resolve — marks item as fully resolved */
  resolve: async (id: string): Promise<void> => {
    await axiosClient.patch(`/claims/${id}/resolve`);
  },
};
