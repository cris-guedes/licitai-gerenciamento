"use client"

import { Badge } from "@/client/components/ui/badge"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeRulesModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const edital = workspace.licitacaoWorkspace?.edital ?? null
  const certame = edital?.certame ?? null
  const execucao = edital?.execucao ?? null
  const habilitacoes = edital?.habilitacoes ?? []
  const habilitacoesPorCategoria = groupByCategory(habilitacoes)

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Regras do certame"
        description="Condições que afetam decisão comercial, disputa e risco de participação."
      >
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <DetailCell label="Modo de disputa" value={certame?.modoDisputa} />
          <DetailCell label="Critério de julgamento" value={certame?.criterioJulgamento} />
          <DetailCell label="Tipo de lance" value={certame?.tipoLance} />
          <DetailCell label="Intervalo de lances" value={certame?.intervaloLances} />
          <DetailCell label="Duração da sessão" value={formatMinutes(certame?.duracaoSessaoMinutos)} />
          <DetailCell label="Regionalidade" value={certame?.regionalidade} />
          <DetailCell label="Exclusivo ME/EPP" value={formatBoolean(certame?.exclusivoMeEpp)} />
          <DetailCell label="Permite consórcio" value={formatBoolean(certame?.permiteConsorcio)} />
          <DetailCell label="Exige visita técnica" value={formatBoolean(certame?.exigeVisitaTecnica)} />
          <DetailCell label="Permite adesão" value={formatBoolean(certame?.permiteAdesao)} />
          <DetailCell label="Percentual de adesão" value={formatPercent(certame?.percentualAdesao)} />
          <DetailCell label="Vigência da ata" value={formatMonths(certame?.vigenciaAtaMeses)} />
          <DetailCell label="Vigência do contrato" value={formatDays(certame?.vigenciaContratoDias)} />
          <DetailCell label="DIFAL" value={formatBoolean(certame?.difal)} />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Execução"
        description="Prazos e condições operacionais que impactam entrega, aceite, pagamento e garantia."
      >
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <DetailCell label="Prazo de entrega" value={formatDaysString(execucao?.prazoEntregaDias)} />
          <DetailCell label="Local de entrega" value={execucao?.localEntrega} className="sm:col-span-2" />
          <DetailCell label="Tipo de entrega" value={execucao?.tipoEntrega} />
          <DetailCell label="Responsável pela instalação" value={execucao?.responsavelInstalacao} />
          <DetailCell label="Prazo de pagamento" value={formatDaysString(execucao?.prazoPagamentoDias)} />
          <DetailCell label="Prazo de aceite" value={formatDaysString(execucao?.prazoAceiteDias)} />
          <DetailCell label="Validade da proposta" value={formatDaysString(execucao?.validadePropostaDias)} />
          <DetailCell label="Tipo de garantia" value={execucao?.garantiaTipo} />
          <DetailCell label="Meses de garantia" value={formatMonthsString(execucao?.garantiaMeses)} />
          <DetailCell label="Tempo de atendimento" value={formatHoursString(execucao?.garantiaTempoAtendimentoHoras)} />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        title="Habilitação"
        description="Documentos e exigências que precisam estar prontos antes da decisão de participar."
        actions={
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
            {habilitacoes.length} exigência{habilitacoes.length === 1 ? "" : "s"}
          </Badge>
        }
      >
        {habilitacoes.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {habilitacoesPorCategoria.map(group => (
              <section key={group.category} className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-primary">{group.category}</h3>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {group.items.length}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {group.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-slate-700">{item.tipo || "Documento sem nome"}</span>
                      <Badge
                        variant={item.obrigatorio ? "outline" : "secondary"}
                        className={item.obrigatorio ? "rounded-full border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700" : "rounded-full text-[10px]"}
                      >
                        {item.obrigatorio ? "Obrigatório" : "Opcional"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyBlock text="Nenhuma exigência de habilitação foi consolidada para esta oportunidade." />
        )}
      </WorkspacePanel>
    </div>
  )
}

function DetailCell({
  label,
  value,
  className,
}: {
  label: string
  value: string | number | null | undefined
  className?: string
}) {
  return (
    <div className={className ? `${className} rounded-lg border border-slate-200 bg-slate-50 px-4 py-3` : "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-900">{value || "Não informado"}</p>
    </div>
  )
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
      {text}
    </div>
  )
}

function groupByCategory<TItem extends { categoria: string }>(items: TItem[]) {
  const map = new Map<string, TItem[]>()
  for (const item of items) {
    const key = item.categoria || "Sem categoria"
    map.set(key, [...(map.get(key) ?? []), item])
  }
  return Array.from(map.entries()).map(([category, groupItems]) => ({ category, items: groupItems }))
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Sim"
  if (value === false) return "Não"
  return null
}

function formatDays(value: number | null | undefined) {
  return value === null || value === undefined ? null : `${value} dia${value === 1 ? "" : "s"}`
}

function formatDaysString(value: string | null | undefined) {
  if (!value) return null
  return `${value} dia${value === "1" ? "" : "s"}`
}

function formatMonths(value: number | null | undefined) {
  return value === null || value === undefined ? null : `${value} ${value === 1 ? "mês" : "meses"}`
}

function formatMonthsString(value: string | null | undefined) {
  if (!value) return null
  return `${value} ${value === "1" ? "mês" : "meses"}`
}

function formatHoursString(value: string | null | undefined) {
  if (!value) return null
  return `${value} hora${value === "1" ? "" : "s"}`
}

function formatMinutes(value: number | null | undefined) {
  return value === null || value === undefined ? null : `${value} minuto${value === 1 ? "" : "s"}`
}

function formatPercent(value: string | null | undefined) {
  if (!value) return null
  return `${value}%`
}
