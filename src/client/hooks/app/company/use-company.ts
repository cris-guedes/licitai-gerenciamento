"use client"

import { useEmpresa } from "./company.context"

/**
 * Hook especializado de empresa — INTERNO ao módulo `app/`.
 *
 * Encapsula o acesso à empresa ativa.
 * Não exportar diretamente para componentes — acessível apenas via useAppContext().
 */
export function useCompany() {
  const empresa = useEmpresa()

  return {
    empresaAtiva:    empresa.empresaAtiva,
    empresaLoading:  empresa.empresaLoading,
    setEmpresaAtiva: empresa.setEmpresaAtiva,
  }
}
