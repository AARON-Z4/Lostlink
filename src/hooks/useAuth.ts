/**
 * src/hooks/useAuth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Convenience hook that wraps the auth Zustand store.
 * Provides derived helpers: isAuthenticated, isAdmin.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useAuth as useAuthStore } from "@/lib/store";

export function useAuth() {
  const { user, token, login, register, logout, refreshUser } = useAuthStore();

  return {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
  };
}
