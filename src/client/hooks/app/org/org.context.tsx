"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useParams, useRouter, usePathname } from "next/navigation"

// ── Tipos públicos ──────────────────────────────────────────────────────────

export interface Org {
  id:   string
  slug: string
}

interface OrgContextType {
  orgAtiva:   Org | null
  setOrgAtiva: (org: Org) => void
}

// ── Context ─────────────────────────────────────────────────────────────────

const OrgContext = createContext<OrgContextType | undefined>(undefined)

// ── Provider ────────────────────────────────────────────────────────────────

/**
 * URL-driven: a org ativa é determinada pelo parâmetro :orgId da URL.
 * Troca de org → navega para a nova URL (/org/:orgId/:companyId/...).
 */
export function OrgProvider({ children }: { children: ReactNode }) {
  const { orgId, companyId } = useParams<{ orgId: string; companyId: string }>()
  const router   = useRouter()
  const pathname = usePathname()

  const orgAtiva = useMemo<Org | null>(
    () => (orgId ? { id: orgId, slug: orgId } : null),
    [orgId],
  )

  function setOrgAtiva(org: Org) {
    if (!orgId || !companyId) return
    const newPath = pathname.replace(`/org/${orgId}/${companyId}`, `/org/${org.id}/${companyId}`)
    router.push(newPath)
  }

  return (
    <OrgContext.Provider value={{ orgAtiva, setOrgAtiva }}>
      {children}
    </OrgContext.Provider>
  )
}

// ── Hook interno ─────────────────────────────────────────────────────────────

/**
 * Hook interno da feature de org.
 * Não usar diretamente em componentes — acessível apenas via useAppContext().
 */
export function useOrg() {
  const ctx = useContext(OrgContext)
  if (ctx === undefined) throw new Error("useOrg must be used within OrgProvider")
  return ctx
}
