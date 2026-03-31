"use client"

import { useMemo }    from "react"
import { useAuth }    from "./auth/use-auth"
import { useCompany } from "./company/use-company"
import { useOrg }     from "./org/org.context"

/**
 * Monta todos os serviços globais da aplicação em um único objeto.
 *
 * Composição de hooks especializados internos:
 *   auth/use-auth.ts         → sessão + ações de autenticação
 *   company/use-company.ts   → empresa ativa
 *   org/org.context.tsx      → organização do usuário
 *
 * Consumir via `useAppContext()` — não use este hook diretamente.
 */
export function useApp() {
  const auth    = useAuth()
  const company = useCompany()
  const org     = useOrg()

  return useMemo(() => ({
    // ── Auth ──────────────────────────────────────────────────────
    user:            auth.user,
    token:           auth.token,
    isAuthenticated: auth.isAuthenticated,
    isPending:       auth.isPending,
    signIn:          auth.signIn,
    signOut:         auth.signOut,
    signUp:          auth.signUp,

    // ── Org ───────────────────────────────────────────────────────
    orgAtiva:    org.orgAtiva,
    setOrgAtiva: org.setOrgAtiva,

    // ── Empresa ───────────────────────────────────────────────────
    empresaAtiva:    company.empresaAtiva,
    empresaLoading:  company.empresaLoading,
    setEmpresaAtiva: company.setEmpresaAtiva,
  }), [auth, company, org])
}
