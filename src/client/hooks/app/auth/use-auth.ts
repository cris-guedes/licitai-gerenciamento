"use client"

import { useSession } from "@/client/hooks/app/auth/use-session/use-session"
import { useAuthMethods } from "./use-auth-methods"

/**
 * Hook especializado de auth — INTERNO ao módulo `app/`.
 *
 * Combina estado de sessão com as ações de auth.
 * Não exportar diretamente para componentes — acessível apenas via useAppContext().
 */
export function useAuth() {
  const session = useSession()
  const methods = useAuthMethods()

  return {
    // ── Estado ────────────────────────────────────────────────────
    user: session.user,
    token: session.token,
    isAuthenticated: session.isAuthenticated,
    isPending: session.isPending,

    // ── Ações ─────────────────────────────────────────────────────
    ...methods,
  }
}
