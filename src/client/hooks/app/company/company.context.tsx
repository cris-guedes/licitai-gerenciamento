"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import { CustomAxiosHttpRequest } from "@/client/main/infra/apis/config/CustomAxiosHttpRequest"
import { useSession } from "@/client/hooks/app/auth/use-session/use-session"

// ── Tipos públicos ──────────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  cnpj: string | null
}

interface CompanyContextType {
  empresaAtiva: Company | null
  empresaLoading: boolean
  setEmpresaAtiva: (company: Company) => void
}

// ── Context ─────────────────────────────────────────────────────────────────

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

// ── Provider ────────────────────────────────────────────────────────────────

interface CompanyProviderProps {
  children: ReactNode
  /** Nome seed vindo do servidor (SSR) para evitar flash no primeiro render */
  initialName?: string
}

/**
 * URL-driven: a empresa ativa é determinada pelo parâmetro :companyId da URL.
 * Troca de empresa → navega para a nova URL (/org/:orgId/:companyId/...).
 */
export function CompanyProvider({ children, initialName }: CompanyProviderProps) {
  const { token } = useSession()
  const { orgId, companyId } = useParams<{ orgId: string; companyId: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const api = useMemo(
    () => new CoreApiClient({ TOKEN: token ?? "" }, CustomAxiosHttpRequest),
    [token],
  )

  const { data: empresaAtiva, isLoading } = useQuery<Company>({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const company = await api.company.fetchCompanyById({ companyId: companyId! })

      return {
        id: company.id,
        name: company.nome_fantasia ?? company.razao_social ?? initialName ?? companyId!,
        cnpj: company.cnpj ?? null,
      }
    },
    enabled: !!companyId,
    staleTime: Infinity,
  })

  function setEmpresaAtiva(company: Company) {
    if (!orgId || !companyId) return
    queryClient.invalidateQueries()
    const newPath = pathname.replace(`/org/${orgId}/${companyId}`, `/org/${orgId}/${company.id}`)
    router.push(newPath)
  }

  return (
    <CompanyContext.Provider value={{
      empresaAtiva: empresaAtiva ?? null,
      empresaLoading: isLoading,
      setEmpresaAtiva,
    }}>
      {children}
    </CompanyContext.Provider>
  )
}

// ── Hook interno ─────────────────────────────────────────────────────────────

/**
 * Hook interno da feature de empresa.
 * Não usar diretamente em componentes — acessível apenas via useAppContext().
 */
export function useEmpresa() {
  const ctx = useContext(CompanyContext)
  if (ctx === undefined) throw new Error("useEmpresa must be used within CompanyProvider")
  return ctx
}
