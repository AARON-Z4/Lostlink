/**
 * src/services/qr.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * QR API:
 *   POST /qr/:itemId   – generate / refresh a QR token for an item
 *   GET  /qr/:itemId   – retrieve existing QR data
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { axiosClient } from "@/lib/axios";

export interface QrData {
  itemId: string;
  token: string;         // short-lived signed token embedded in QR URL
  url: string;           // full public URL encoded into the QR code
  expiresAt: string;     // ISO timestamp
}

export const qrService = {
  /** POST /qr/:itemId — create or refresh QR token */
  generate: async (itemId: string): Promise<QrData> => {
    const { data } = await axiosClient.post<QrData>(`/qr/${itemId}`);
    return data;
  },

  /** GET /qr/:itemId — fetch existing QR data */
  get: async (itemId: string): Promise<QrData> => {
    const { data } = await axiosClient.get<QrData>(`/qr/${itemId}`);
    return data;
  },
};
