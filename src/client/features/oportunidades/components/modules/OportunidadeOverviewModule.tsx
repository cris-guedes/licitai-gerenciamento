"use client"

import { Building2, CalendarClock, CircleDollarSign, FileCheck2, Gavel, Layers3 } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { WorkspaceMetricGrid, WorkspaceMetricCard, WorkspacePanel } from "@/client/components/workspace"
import { formatCurrency, formatDate } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeOverviewModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const { oportunidade, resumo } = workspace
  const edital = workspace.licitacaoWorkspace?.edital ?? null
  const certame = edital?.certame ?? null
  const cronograma = edital?.cronograma ?? null
  const habilitacoesObrigatorias = edital?.habilitacoes.filter(item => item.obrigatorio).length ?? 0
  const participantes = edital?.orgaos.filter(orgao => orgao.papel !== "GERENCIADOR").length ?? 0

  return (
    <WorkspacePanel
      title="Visão geral"
      description="Resumo operacional para decidir, preparar documentos e acompanhar prazos do edital."
    >
      <div className="space-y-6">
        <WorkspaceMetricGrid className="xl:grid-cols-5">
          <WorkspaceMetricCard
            label="Órgão"
            value={oportunidade.orgaoNome ?? "Não identificado"}
            valueClassName="text-base"
            icon={<Building2 className="size-5 text-slate-600" />}
            description={participantes > 0 ? `${participantes} participante${participantes === 1 ? "" : "s"}` : "Entidade compradora"}
          />
          <WorkspaceMetricCard
            label="Valor Estimado"
            value={formatCurrency(oportunidade.valorEstimado) ?? "A definir"}
            valueClassName="text-base"
            icon={<CircleDollarSign className="size-5 text-emerald-600" />}
            description="Estimativa captada"
          />
          <WorkspaceMetricCard
            label="Itens"
            value={`${edital?.itens.length ?? oportunidade.itemCount}`}
            valueClassName="text-base"
            icon={<Layers3 className="size-5 text-sky-600" />}
            description="Itens licitados"
          />
          <WorkspaceMetricCard
            label="Habilitação"
            value={`${habilitacoesObrigatorias}`}
            valueClassName="text-base"
            icon={<FileCheck2 className="size-5 text-violet-600" />}
            description="Exigências obrigatórias"
          />
          <WorkspaceMetricCard
            label="Documentos"
            value={`${workspace.documentsSummary.ready}/${workspace.documentsSummary.total}`}
            valueClassName="text-base"
            icon={<Gavel className="size-5 text-amber-600" />}
            description="Prontos para consulta"
          />
        </WorkspaceMetricGrid>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <section className="rounded-lg border border-slate-200 bg-white px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              {oportunidade.modalidade ? (
                <Badge className="rounded-full bg-slate-900 text-white shadow-none">{oportunidade.modalidade}</Badge>
              ) : null}
              {edital?.srp ? (
                <Badge variant="outline" className="rounded-full border-sky-200 bg-sky-50 text-sky-700">SRP</Badge>
              ) : null}
              {certame?.exclusivoMeEpp === true ? (
                <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">Exclusivo ME/EPP</Badge>
              ) : null}
              {certame?.exigeVisitaTecnica === true ? (
                <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">Visita técnica</Badge>
              ) : null}
            </div>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Objeto</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {resumo ?? edital?.objeto ?? "Ainda não há um objeto estruturado para esta oportunidade."}
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-primary">Prazos críticos</h3>
            </div>
            <div className="mt-4 space-y-3">
              <DeadlineRow label="Abertura" value={edital?.dataAbertura ?? workspace.licitacaoWorkspace?.licitacao.dataAberturaProposta ?? null} />
              <DeadlineRow label="Encerramento" value={edital?.dataEncerramento ?? workspace.licitacaoWorkspace?.licitacao.dataEncerramentoProposta ?? null} />
              <DeadlineRow label="Esclarecimentos" value={cronograma?.esclarecimentosAte ?? null} />
              <DeadlineRow label="Impugnação" value={cronograma?.impugnacaoAte ?? null} />
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <QuickBlock
            title="Disputa"
            rows={[
              ["Critério", certame?.criterioJulgamento],
              ["Modo", certame?.modoDisputa],
              ["Lance", certame?.tipoLance],
            ]}
          />
          <QuickBlock
            title="Execução"
            rows={[
              ["Entrega", formatDaysString(edital?.execucao?.prazoEntregaDias)],
              ["Pagamento", formatDaysString(edital?.execucao?.prazoPagamentoDias)],
              ["Garantia", formatMonthsString(edital?.execucao?.garantiaMeses)],
            ]}
          />
          <QuickBlock
            title="Participação"
            rows={[
              ["Consórcio", formatBoolean(certame?.permiteConsorcio)],
              ["Adesão", formatBoolean(certame?.permiteAdesao)],
              ["DIFAL", formatBoolean(certame?.difal)],
            ]}
          />
        </div>
      </div>
    </WorkspacePanel>
  )
}

function DeadlineRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value ? formatDate(value) : "Não informado"}</span>
    </div>
  )
}

function QuickBlock({
  title,
  rows,
}: {
  title: string
  rows: Array<[string, string | null | undefined]>
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-medium text-slate-900">{value || "Não informado"}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Sim"
  if (value === false) return "Não"
  return null
}

function formatDaysString(value: string | null | undefined) {
  if (!value) return null
  return `${value} dia${value === "1" ? "" : "s"}`
}

function formatMonthsString(value: string | null | undefined) {
  if (!value) return null
  return `${value} ${value === "1" ? "mês" : "meses"}`
}
