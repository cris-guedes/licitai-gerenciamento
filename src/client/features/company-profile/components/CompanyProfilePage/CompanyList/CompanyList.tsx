"use client"

import { Building2, FileText } from "lucide-react"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"

type Props = {
  companies: CompanyProfile[]
  selectedCompanyId: string | null
  activeCompanyId: string | null
  onSelect: (companyId: string) => void
}

export function CompanyList({ companies, selectedCompanyId, onSelect }: Props) {
  return (
    <div className="w-64 shrink-0 space-y-1.5">
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Empresas
      </p>

      {companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
          Nenhuma empresa cadastrada.
        </div>
      ) : (
        companies.map((company) => {
          const isSelected = company.id === selectedCompanyId

          return (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelect(company.id)}
              className={`group w-full rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-transparent hover:border-border/60 hover:bg-muted/40"
              }`}
            >
              <div className="mb-3">
                <div className={`flex size-8 items-center justify-center rounded-lg ${
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Building2 className="size-3.5" />
                </div>
              </div>

              <p className="truncate text-sm font-semibold leading-snug text-foreground">
                {company.nome_fantasia ?? company.razao_social}
              </p>
              {company.nome_fantasia && (
                <p className="truncate text-[11px] leading-tight text-muted-foreground mt-0.5">
                  {company.razao_social}
                </p>
              )}

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FileText className="size-2.5 shrink-0" />
                <span className="font-mono truncate">{company.cnpj}</span>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
