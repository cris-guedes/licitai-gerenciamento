"use client";

import { useSession } from "@/client/main/infra/auth/auth.client";

export function useToken(): string | null {
  const { data: session } = useSession();
  return session?.session?.token ?? null;
}
