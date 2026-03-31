"use client";

import { useSession as useBetterAuthSession } from "@/client/main/infra/auth/auth.client";
import { useToken } from "./use-token";
import { useUser } from "./use-user";

/**
 * Central session hook. Use this in feature hooks and components — never import
 * use-token or use-user directly from outside this folder.
 */
export function useSession() {
  const { isPending } = useBetterAuthSession();
  const token = useToken();
  const user = useUser();

  return {
    token,
    user,
    isAuthenticated: !!token,
    isPending,
  };
}
