"use client";

import { useSession } from "@/client/main/infra/auth/auth.client";

export function useUser() {
  const { data: session } = useSession();
  return session?.user ?? null;
}
