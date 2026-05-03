/**
 * src/lib/axios.ts
 * Configured Axios instance matched to the real LostLink Express backend.
 *
 * Backend URL: http://localhost:5000  (no /api prefix — routes are root-mounted)
 * Auth:        Supabase JWT via Authorization: Bearer <access_token>
 * 401:         Clears auth state + redirects to /auth/login
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuth } from "./store";

// ─── Typed API Error ──────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "message" in e && "status" in e;
}

export function extractApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    // Backend sends { error: "..." }
    return {
      status: error.response?.status ?? 0,
      message:
        (typeof data?.error === "string" ? data.error : null) ??
        (typeof data?.message === "string" ? data.message : null) ??
        (Array.isArray(data?.errors) && data.errors[0]?.msg ? data.errors[0].msg : null) ??
        error.message ??
        "An unexpected error occurred.",
      errors: data?.errors,
    };
  }
  return { status: 0, message: "Network error — is the backend running on port 5000?" };
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
// Backend is at http://localhost:5000 (no /api prefix)
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: normalise errors ────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(extractApiError(error));
  },
);
