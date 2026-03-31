"use client"

import { createContext, useContext } from "react"

interface DashboardContextValue {
  orgId:     string
  companyId: string
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  orgId,
  companyId,
  children,
}: DashboardContextValue & { children: React.ReactNode }) {
  return (
    <DashboardContext.Provider value={{ orgId, companyId }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider")
  return ctx
}
