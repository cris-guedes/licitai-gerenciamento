"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { Company } from "@/client/hooks/app/company/company.context"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"
import type { CompanyProfileFormValues } from "../../../schemas/company-profile.schema"
import type { useCompanyProfileService } from "../../../services/company"

type Deps = {
  organizationId: string
  activeCompanyId: string | null
  setEmpresaAtiva: (company: Company) => void
  companyProfileService: ReturnType<typeof useCompanyProfileService>
}

function toCompanySwitcher(company: CompanyProfile): Company {
  return {
    id: company.id,
    name: company.nome_fantasia ?? company.razao_social,
    cnpj: company.cnpj,
  }
}

export function useCompanyProfilePage({
  activeCompanyId,
  setEmpresaAtiva,
  companyProfileService,
}: Deps) {
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const detailQuery = companyProfileService.detail({
    companyId: activeCompanyId ?? "",
    enabled: !!activeCompanyId,
  })

  const selectedCompany = detailQuery.data ?? null

  async function handleUpdate(values: CompanyProfileFormValues) {
    if (!activeCompanyId) return
    try {
      const company = await companyProfileService.update.mutateAsync({
        companyId: activeCompanyId,
        data: values,
      })
      toast.success("Dados da empresa atualizados.")
      setEditOpen(false)
      setEmpresaAtiva(toCompanySwitcher(company))
    } catch (error: any) {
      toast.error(error?.body?.message ?? error?.message ?? "Não foi possível salvar a empresa.")
    }
  }

  async function handleDelete() {
    if (!selectedCompany) return
    try {
      await companyProfileService.remove.mutateAsync({ companyId: selectedCompany.id })
      toast.success("Empresa removida com sucesso.")
      setDeleteOpen(false)
    } catch (error: any) {
      toast.error(error?.body?.message ?? error?.message ?? "Não foi possível excluir a empresa.")
    }
  }

  return {
    selectedCompany,
    editOpen,
    deleteOpen,
    activeCompanyId,
    isLoading: detailQuery.isLoading,
    isSaving: companyProfileService.update.isPending,
    isDeleting: companyProfileService.remove.isPending,
    canDeleteSelected: false, // empresa ativa não pode ser excluída sem trocar antes
    setEditOpen,
    setDeleteOpen,
    handleUpdate,
    handleDelete,
  }
}
