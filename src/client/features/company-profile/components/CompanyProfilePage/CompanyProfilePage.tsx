"use client"

import { Building2 } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { CompanyDeleteDialog } from "./CompanyDeleteDialog"
import { CompanyEditDialog } from "./CompanyEditDialog"
import { CompanyProfileForm } from "./CompanyProfileForm"
import { useCompanyProfilePage } from "./hooks/useCompanyProfilePage"
import { useCompanyProfileService } from "../../services/company"

export function CompanyProfilePage() {
  const api = useCoreApi()
  const companyProfileService = useCompanyProfileService(api)
  const { orgAtiva, empresaAtiva, setEmpresaAtiva } = useAppContext()

  const page = useCompanyProfilePage({
    organizationId: orgAtiva?.id ?? "",
    activeCompanyId: empresaAtiva?.id ?? null,
    setEmpresaAtiva,
    companyProfileService,
  })

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Building2 className="size-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Gerenciar Empresa</h1>
          <p className="text-xs text-muted-foreground">Revise e edite os dados cadastrais da empresa ativa.</p>
        </div>
      </div>

      {/* Profile */}
      {page.isLoading && !page.selectedCompany ? (
        <div className="rounded-xl border border-dashed bg-card/70 p-10 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Building2 className="size-4 animate-pulse" />
          Carregando...
        </div>
      ) : (
        <CompanyProfileForm
          company={page.selectedCompany}
          isPending={page.isSaving}
          canDelete={page.canDeleteSelected}
          onEdit={() => page.setEditOpen(true)}
          onDelete={() => page.setDeleteOpen(true)}
        />
      )}

      <CompanyEditDialog
        open={page.editOpen}
        company={page.selectedCompany}
        isPending={page.isSaving}
        onClose={() => page.setEditOpen(false)}
        onSubmit={page.handleUpdate}
      />

      <CompanyDeleteDialog
        open={page.deleteOpen}
        isPending={page.isDeleting}
        company={page.selectedCompany}
        onClose={() => page.setDeleteOpen(false)}
        onConfirm={page.handleDelete}
      />
    </div>
  )
}
