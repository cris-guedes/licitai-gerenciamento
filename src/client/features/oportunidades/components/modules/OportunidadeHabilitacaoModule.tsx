"use client"

import { Badge } from "@/client/components/ui/badge"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeWorkspaceQualification, OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeHabilitacaoModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const habilitacoes = workspace.licitacaoWorkspace?.edital?.habilitacoes ?? []
  const groups = groupByCategory(habilitacoes)

  return (
    <WorkspacePanel
      title="Habilitação"
      description="Exigências documentais extraídas do edital para orientar a preparação antes da participação."
      actions={
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
          {workspace.qualificationSummary.total} exigência{workspace.qualificationSummary.total === 1 ? "" : "s"}
        </Badge>
      }
    >
      {habilitacoes.length ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Obrigatórias" value={workspace.qualificationSummary.mandatory} tone="emerald" />
            <SummaryCard label="Opcionais" value={workspace.qualificationSummary.optional} tone="slate" />
            <SummaryCard label="Categorias" value={workspace.qualificationSummary.categories} tone="sky" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {groups.map(group => (
              <section key={group.category} className="rounded-xl border border-slate-200 bg-slate-50/65 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{group.category}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {group.items.length} item{group.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {group.items.filter(item => item.obrigatorio).length} obrigatória{group.items.filter(item => item.obrigatorio).length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  {group.items
                    .slice()
                    .sort((a, b) => {
                      if ((a.ordem ?? 999) !== (b.ordem ?? 999)) return (a.ordem ?? 999) - (b.ordem ?? 999)
                      return (a.tipo || "").localeCompare(b.tipo || "")
                    })
                    .map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {item.tipo || "Documento sem descrição"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.obrigatorio ? "Entrega exigida para habilitação." : "Pode ser solicitado conforme o caso."}
                          </p>
                        </div>
                        <Badge
                          variant={item.obrigatorio ? "outline" : "secondary"}
                          className={item.obrigatorio
                            ? "rounded-full border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                            : "rounded-full text-[10px] text-slate-600"}
                        >
                          {item.obrigatorio ? "Obrigatório" : "Opcional"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
          Nenhuma exigência de habilitação foi consolidada para esta oportunidade.
        </div>
      )}
    </WorkspacePanel>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "emerald" | "sky" | "slate"
}) {
  const toneClassName = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone]

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${toneClassName}`}>
          {value}
        </span>
        <span className="text-sm text-slate-500">no edital</span>
      </div>
    </div>
  )
}

function groupByCategory(items: OportunidadeWorkspaceQualification[]) {
  const map = new Map<string, OportunidadeWorkspaceQualification[]>()

  for (const item of items) {
    const key = item.categoria?.trim() || "Sem categoria"
    map.set(key, [...(map.get(key) ?? []), item])
  }

  return Array.from(map.entries())
    .map(([category, groupItems]) => ({ category, items: groupItems }))
    .sort((a, b) => a.category.localeCompare(b.category))
}
