"use client"

import type { ReactNode } from "react"
import { CalendarClock, ChevronDown, FileText } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/client/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { WorkspacePanel } from "@/client/components/workspace"
import { cn } from "@/client/main/lib/utils"
import { formatCurrency, formatDate, formatDocumentType } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"
import { OportunidadeHistoryModule } from "./OportunidadeHistoryModule"
import { OportunidadeNotesModule } from "./OportunidadeNotesModule"
import { OportunidadeOwnerModule } from "./OportunidadeOwnerModule"
import { OportunidadeTasksModule } from "./OportunidadeTasksModule"
import { OportunidadeWorkflowModule } from "./OportunidadeWorkflowModule"
import type { OportunidadeBoardItem, WorkflowNode } from "@/client/features/licitacoes/services/use-licitacao.service"

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

export function OportunidadeOverviewModule({
  workspace,
  item,
  companyId,
  oportunidadeId,
  phaseOptions,
  statusOptions,
  situationOptions,
  responsavelOptions,
  moveOptions,
  isMoving,
  isUpdating,
  onQuickUpdate,
  onMove,
}: {
  workspace: OportunidadeWorkspaceModel
  item: OportunidadeBoardItem
  companyId: string
  oportunidadeId: string
  phaseOptions: WorkflowNode[]
  statusOptions: WorkflowNode[]
  situationOptions: WorkflowNode[]
  responsavelOptions: Array<{ id: string; name: string; email: string }>
  moveOptions: MoveOption[]
  isMoving: boolean
  isUpdating: boolean
  onQuickUpdate: (patch: {
    responsavelUserId?: string | null
    phaseNodeId?: string
    statusNodeId?: string
    situationNodeId?: string
  }) => Promise<void>
  onMove: (targetNodeId: string) => Promise<void>
}) {
  const { oportunidade, resumo } = workspace
  const licitacao = workspace.licitacaoWorkspace?.licitacao ?? null
  const edital = workspace.licitacaoWorkspace?.edital ?? null
  const certame = edital?.certame ?? null
  const cronograma = edital?.cronograma ?? null
  const habilitacoesObrigatorias = edital?.habilitacoes.filter(item => item.obrigatorio).length ?? 0
  const itemCount = edital?.itens.length ?? oportunidade.itemCount
  const valorEstimadoPrincipal = formatCurrency(
    licitacao?.valorEstimadoTotal
    ?? oportunidade.valorEstimado
    ?? edital?.valorEstimado
    ?? null,
  ) ?? "Não informado"
  const valorHomologadoPrincipal = formatCurrency(licitacao?.valorHomologadoTotal ?? null)
  const tasksDonePercent = workspace.tasksSummary.total > 0
    ? Math.round((workspace.tasksSummary.done / workspace.tasksSummary.total) * 100)
    : 0
  const overviewDocuments = [...workspace.documents].sort((a, b) => {
    const typeOrder = { EDITAL: 0, ANEXO: 1, OUTRO: 2 } as const
    const aOrder = typeOrder[a.type as keyof typeof typeOrder] ?? 99
    const bOrder = typeOrder[b.type as keyof typeof typeOrder] ?? 99
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.originalName.localeCompare(b.originalName)
  })

  return (
    <WorkspacePanel
      className="h-full border-0 bg-transparent shadow-none"
      contentClassName="h-full px-0 pb-0 pt-0"
    >
      <div className="flex min-h-0 flex-col gap-4 xl:h-full xl:flex-row xl:items-stretch">
        <div className="min-w-0 space-y-4 xl:h-full xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
            <Accordion type="multiple" defaultValue={["overview", "schedule", "documents"]} className="space-y-1">
              <OverviewAccordionItem value="overview" title="Visão geral">
                <div className="space-y-6 pb-1">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                      <OverviewField label="Modalidade" value={oportunidade.modalidade ?? edital?.modalidade} bordered />
                      <OverviewField label="Valor estimado" value={valorEstimadoPrincipal} emphasized bordered />
                      <OverviewField label="Data de abertura" value={formatDate(edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? null)} bordered />
                      <OverviewField label="Localização" value={formatLocation(edital?.municipio, edital?.uf)} />
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3">
                      <OverviewField label="Encerramento de propostas" value={formatDate(edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null)} bordered />
                      <OverviewField label="Publicado no PNCP" value={formatDateOnly(licitacao?.dataPublicacao ?? null)} bordered />
                      <OverviewField label="Nº do processo" value={edital?.processo ?? licitacao?.processoAdministrativo ?? oportunidade.numero} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <OverviewMetricCard
                      label="Valor total estimado"
                      value={valorEstimadoPrincipal}
                      tone="estimate"
                    />
                    {valorHomologadoPrincipal ? (
                      <OverviewMetricCard
                        label="Valor homologado"
                        value={valorHomologadoPrincipal}
                        tone="success"
                      />
                    ) : null}
                    <OverviewMetricCard
                      label="Itens"
                      value={String(itemCount)}
                      tone="plain"
                    />
                  </div>

                  <OverviewInfoSection title="Resumo & descrição completa">
                    <div className="space-y-4 border-l border-slate-200 pl-3">
                      <p className="text-[13px] leading-6 text-slate-700">
                        {resumo ?? edital?.objeto ?? "Ainda não há um objeto estruturado para esta oportunidade."}
                      </p>
                      {edital?.informacaoComplementar ? (
                        <p className="text-[13px] leading-6 text-slate-600">
                          {edital.informacaoComplementar}
                        </p>
                      ) : null}
                    </div>
                  </OverviewInfoSection>

                  <OverviewInfoSection title="Contatos">
                    <div className="grid gap-4 md:grid-cols-2">
                      <OverviewDetailColumn
                        rows={[
                          ["Órgão", edital?.orgaoRazaoSocial ?? oportunidade.orgaoNome],
                          ["Unidade compradora", edital?.unidadeNome],
                          ["Esfera", formatScope(edital?.orgaoEsfera)],
                        ]}
                      />
                      <OverviewDetailColumn
                        rows={[
                          ["CNPJ", edital?.orgaoCnpj],
                          ["Município / UF", formatLocation(edital?.municipio, edital?.uf)],
                          ["Poder", formatPower(edital?.orgaoPoder)],
                        ]}
                      />
                    </div>
                  </OverviewInfoSection>

                  <OverviewInfoSection title="Informações adicionais">
                    <div className="grid gap-4 md:grid-cols-2">
                      <OverviewDetailColumn
                        rows={[
                          ["Amparo legal", edital?.amparoLegal],
                          ["Tipo de instrumento", edital?.tipoInstrumento],
                        ]}
                      />
                      <OverviewDetailColumn
                        rows={[
                          ["Modo de disputa", certame?.modoDisputa ?? edital?.modoDisputa],
                          ["Registro de preço", formatBoolean(edital?.srp)],
                          ["Habilitações obrigatórias", habilitacoesObrigatorias ? `${habilitacoesObrigatorias}` : null],
                        ]}
                      />
                    </div>
                  </OverviewInfoSection>
                </div>
              </OverviewAccordionItem>

              <OverviewAccordionItem value="schedule" title="Cronograma">
                <div className="space-y-4 pb-1">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClock className="size-4" />
                    <span className="text-sm font-medium text-slate-700">Marcos essenciais</span>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <DeadlineRow label="Abertura" value={edital?.dataAbertura ?? workspace.licitacaoWorkspace?.licitacao.dataAberturaProposta ?? null} />
                    <DeadlineRow label="Encerramento" value={edital?.dataEncerramento ?? workspace.licitacaoWorkspace?.licitacao.dataEncerramentoProposta ?? null} />
                    <DeadlineRow label="Esclarecimentos" value={cronograma?.esclarecimentosAte ?? null} />
                    <DeadlineRow label="Impugnação" value={cronograma?.impugnacaoAte ?? null} />
                  </div>
                </div>
              </OverviewAccordionItem>

              <OverviewAccordionItem
                value="documents"
                title="Documentos"
                aside={
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {overviewDocuments.length}
                  </span>
                }
              >
                {overviewDocuments.length ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-3">
                    {overviewDocuments.map(document => {
                      const href = document.previewUrl || document.documentUrl || null

                      return href ? (
                        <a
                          key={document.id}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
                        >
                          <DocumentPreviewCard document={document} />
                        </a>
                      ) : (
                        <div
                          key={document.id}
                          className="flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                          <DocumentPreviewCard document={document} />
                        </div>
                      )
                    })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Nenhum documento vinculado.
                  </div>
                )}
              </OverviewAccordionItem>

            </Accordion>

          <Accordion type="multiple" defaultValue={["activity"]} className="space-y-1">
            <OverviewAccordionItem value="activity" title="Atividade">
              <Tabs defaultValue="notes" className="gap-4">
                <TabsList
                  variant="line"
                  className="w-fit gap-6 rounded-none border-b border-slate-200 bg-transparent p-0 text-slate-500"
                >
                  <TabsTrigger
                    value="notes"
                    className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900"
                  >
                    Comentários
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900"
                  >
                    Registro de atividades
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="group/tasks h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>Tarefas</span>
                      <span className="text-xs font-medium text-slate-400 group-data-[state=active]/tasks:text-slate-500">
                        {tasksDonePercent}%
                      </span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="notes">
                  <OportunidadeNotesModule
                    workspace={workspace}
                    companyId={companyId}
                    oportunidadeId={oportunidadeId}
                    embedded
                  />
                </TabsContent>

                <TabsContent value="history">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                    <OportunidadeHistoryModule workspace={workspace} embedded />
                  </div>
                </TabsContent>

                <TabsContent value="tasks">
                  <OportunidadeTasksModule
                    workspace={workspace}
                    companyId={companyId}
                    oportunidadeId={oportunidadeId}
                    embedded
                  />
                </TabsContent>
              </Tabs>
            </OverviewAccordionItem>
          </Accordion>
        </div>

        <div className="space-y-4 xl:w-[320px] xl:shrink-0 xl:self-start">
          <OverviewStaticSection title="Responsável">
            <OportunidadeOwnerModule
              item={item}
              responsavelOptions={responsavelOptions}
              disabled={isMoving || isUpdating}
              onQuickUpdate={onQuickUpdate}
              embedded
            />
          </OverviewStaticSection>

          <OverviewStaticSection title="Fluxo">
            <OportunidadeWorkflowModule
              item={item}
              phaseOptions={phaseOptions}
              statusOptions={statusOptions}
              situationOptions={situationOptions}
              moveOptions={moveOptions}
              isMoving={isMoving}
              isUpdating={isUpdating}
              onQuickUpdate={onQuickUpdate}
              onMove={onMove}
              embedded
            />
          </OverviewStaticSection>
        </div>
      </div>
    </WorkspacePanel>
  )
}

function DocumentPreviewCard({
  document,
}: {
  document: OportunidadeWorkspaceModel["documents"][number]
}) {
  const isImage = document.mimeType.startsWith("image/")

  return (
    <>
      <div className="h-36 overflow-hidden border-b border-slate-200 bg-slate-100">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.previewUrl || document.documentUrl}
            alt={document.displayName ?? document.originalName}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <iframe
            src={document.previewUrl || document.documentUrl}
            title={document.displayName ?? document.originalName}
            className="pointer-events-none size-full bg-white"
            loading="lazy"
          />
        )}
      </div>
      <div className="space-y-1 px-3 py-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
          <FileText className="size-4 text-slate-500" />
          <span>{formatDocumentType(document.type)}</span>
        </div>
        <p className="text-xs text-slate-500">
          {formatDate(document.uploadedAt)}
        </p>
      </div>
    </>
  )
}

function OverviewAccordionItem({
  value,
  title,
  aside,
  children,
}: {
  value: string
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <AccordionItem value={value} className="border-0">
      <AccordionTrigger className="group/overview rounded-none py-2 text-[1.05rem] font-semibold text-slate-900 hover:no-underline [&>svg:last-child]:hidden">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <ChevronDown className="size-4 -rotate-90 text-slate-500 transition-transform group-data-[state=open]/overview:rotate-0" />
            <span className="truncate">{title}</span>
          </span>
          {aside ? <span className="shrink-0">{aside}</span> : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 pb-4">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}

function OverviewStaticSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="py-2 text-[1.05rem] font-semibold text-slate-900">
        {title}
      </div>
      {children}
    </section>
  )
}

function OverviewField({
  label,
  value,
  emphasized = false,
  bordered = false,
}: {
  label: string
  value: ReactNode
  emphasized?: boolean
  bordered?: boolean
}) {
  const displayValue = value === null || value === undefined || value === "" ? "Não informado" : value

  return (
    <div className={cn("px-4 py-3", bordered && "border-r border-slate-200")}>
      <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p
        className={[
          "mt-1 text-[13px] leading-5",
          emphasized
            ? "font-semibold tracking-[-0.02em] text-primary sm:text-[15px]"
            : "font-medium text-slate-900",
        ].join(" ")}
      >
        {displayValue}
      </p>
    </div>
  )
}

function OverviewMetricCard({
  label,
  value,
  tone = "estimate",
}: {
  label: string
  value: string
  tone?: "estimate" | "success" | "plain"
}) {
  return (
    <div
      className={cn(
        "min-w-[172px] rounded-[1.1rem] border px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]",
        tone === "estimate" && "border-slate-200 bg-slate-100/90",
        tone === "success" && "border-emerald-100 bg-emerald-50/90",
        tone === "plain" && "border-slate-200 bg-white shadow-none",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.16em]",
          tone === "estimate" && "text-slate-700",
          tone === "success" && "text-emerald-600",
          tone === "plain" && "text-slate-500",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-[1.05rem] font-semibold tracking-[-0.02em]",
          tone === "estimate" && "text-slate-950",
          tone === "success" && "text-emerald-700",
          tone === "plain" && "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function DeadlineRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-slate-900">{value ? formatDate(value) : "Não informado"}</p>
    </div>
  )
}

function OverviewInfoSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-slate-200 pt-5">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">
        {title}
      </h3>
      <div className="mt-4">
        {children}
      </div>
    </section>
  )
}

function OverviewDetailColumn({
  rows,
}: {
  rows: Array<[string, ReactNode]>
}) {
  return (
    <div className="space-y-3.5">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-[13px] font-medium text-slate-900">
            {value || "Não informado"}
          </p>
        </div>
      ))}
    </div>
  )
}

function formatLocation(municipio: string | null | undefined, uf: string | null | undefined) {
  if (municipio && uf) return `${municipio} - ${uf}`
  return municipio || uf || "Não informado"
}

function formatScope(value: string | null | undefined) {
  if (!value) return "Não informado"

  const labels: Record<string, string> = {
    FEDERAL: "Federal",
    ESTADUAL: "Estadual",
    MUNICIPAL: "Municipal",
  }

  return labels[value] ?? value
}

function formatPower(value: string | null | undefined) {
  if (!value) return "Não informado"

  const labels: Record<string, string> = {
    EXECUTIVO: "Executivo",
    LEGISLATIVO: "Legislativo",
    JUDICIARIO: "Judiciário",
  }

  return labels[value] ?? value
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Sim"
  if (value === false) return "Não"
  return "Não informado"
}

function formatDateOnly(value: string | null) {
  if (!value) return "Não informado"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value))
}
