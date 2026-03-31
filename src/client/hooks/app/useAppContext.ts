"use client"

import { useContext } from "react"
import { AppContext } from "./AppContextProvider"

/**
 * Hook principal para acessar o contexto global da aplicação.
 *
 * Expõe em um único lugar:
 * - Auth:    `user`, `token`, `isAuthenticated`, `isPending`
 * - Actions: `signIn`, `signOut`, `signUp`
 * - Org:     `orgAtiva`, `setOrgAtiva`
 * - Empresa: `empresaAtiva`, `empresaLoading`, `setEmpresaAtiva`
 *
 * Uso:
 * ```ts
 * const { user, empresaAtiva, signOut } = useAppContext()
 * ```
 */
export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider")
  }

  return context
}
