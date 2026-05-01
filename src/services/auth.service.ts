/**
 * src/services/auth.service.ts
 * Matched exactly to the real backend controllers:
 *
 *  POST /auth/register  → { message, user, access_token, refresh_token }
 *  POST /auth/login     → { message, user, access_token, refresh_token }
 *  POST /auth/logout    → { message }
 *  GET  /auth/me        → { user }
 *  POST /auth/refresh   → { access_token, refresh_token }
 */
import { axiosClient } from "@/lib/axios";
import type { User } from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Real backend response shape
export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface MeResponse {
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  /** POST /auth/login */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  /** POST /auth/register */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  /** GET /auth/me — requires Bearer token */
  me: async (): Promise<User> => {
    const { data } = await axiosClient.get<MeResponse>("/auth/me");
    return data.user;
  },

  /** POST /auth/logout */
  logout: async (): Promise<void> => {
    await axiosClient.post("/auth/logout").catch(() => {});
  },

  /** POST /auth/refresh */
  refresh: async (refresh_token: string): Promise<RefreshResponse> => {
    const { data } = await axiosClient.post<RefreshResponse>("/auth/refresh", { refresh_token });
    return data;
  },
};
