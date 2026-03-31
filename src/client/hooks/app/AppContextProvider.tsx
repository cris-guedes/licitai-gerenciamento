"use client"

import { createContext, type ReactNode } from "react"
import { OrgProvider }     from "./org/org.context"
import { CompanyProvider } from "./company/company.context"
import { useApp }          from "./useApp"

// ── Tipo público do contexto ─────────────────────────────────────────────────

export type AppContextValue = ReturnType<typeof useApp>

export const AppContext = createContext<AppContextValue>({} as AppContextValue)

// ── Inner: existe dentro dos providers, pode chamar useApp() ─────────────────

function AppContextInner({ children }: { children: ReactNode }) {
  const value = useApp()
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AppContextProviderProps {
  children:            ReactNode
  /** Nome seed da empresa vindo do servidor (SSR) para evitar flash */
  companyInitialName?: string
}

// ── Provider público: único wrapper necessário no DashboardShell ─────────────

export function AppContextProvider({ children, companyInitialName }: AppContextProviderProps) {
  return (
    <OrgProvider>
      <CompanyProvider initialName={companyInitialName}>
        <AppContextInner>
          {children}
        </AppContextInner>
      </CompanyProvider>
    </OrgProvider>
  )
}
