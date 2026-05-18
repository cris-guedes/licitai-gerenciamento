"use client"

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
