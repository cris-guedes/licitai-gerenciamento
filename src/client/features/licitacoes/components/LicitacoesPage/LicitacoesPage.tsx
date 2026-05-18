"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ListFilter,
  LoaderCircle,
  RotateCcw,
  Plus,
  Search,
  Target,
} from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { Input } from "@/client/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/client/components/ui/toggle-group"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useApp } from "@/client/hooks/app/useApp"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { OportunidadeDetailDialog } from "./OportunidadeDetailDialog"
import { OportunidadesKanbanView } from "./OportunidadesKanbanView"
import { OportunidadesListView } from "./OportunidadesListView"
import { WorkflowTreeFilter } from "./WorkflowTreeFilter"
import { useLicitacoesPage } from "./hooks/useLicitacoesPage"

export function LicitacoesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useCoreApi()
  const { empresaAtiva, orgAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const page = useLicitacoesPage({
    licitacaoService,
    companyId: empresaAtiva?.id ?? null,
    organizationId: orgAtiva?.id ?? null,
    initialDetailOportunidadeId: searchParams.get("oportunidadeId"),
  })
  const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`
  const licitacoesHref = `${base}/licitacoes`
  const detailWorkspaceHref = page.selectedDetailItem
    ? `${base}/oportunidades/${page.selectedDetailItem.oportunidadeId}`
    : null
  const detailErrorMessage = page.detailError instanceof Error
    ? page.detailError.message
    : page.detailError
      ? "Não foi possível carregar os detalhes completos desta oportunidade."
      : null

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden">
      <DashboardHeaderActions>
        <Button asChild>
          <Link href={`${base}/licitacoes/nova`}>
            <Plus className="mr-2 size-4" />
            Nova Oportunidade
          </Link>
        </Button>
      </DashboardHeaderActions>

      <section className="min-w-0 max-w-full space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] p-4 shadow-[0_18px_40px_rgba(4,22,39,0.05)]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={page.search}
                  onChange={event => page.setSearch(event.target.value)}
                  placeholder="Buscar por nome ou número do processo..."
                  className="h-12 rounded-xl border-slate-200 bg-white pl-11 text-[0.95rem] shadow-none"
                />
              </div>

              <ToggleGroup
                type="single"
                value={page.viewMode}
                onValueChange={(value) => {
                  if (value === "kanban" || value === "lista") {
                    page.setViewMode(value)
                  }
                }}
                variant="outline"
                className="w-full justify-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto"
              >
                <ToggleGroupItem value="kanban" aria-label="Visualização em kanban" className="flex-1 rounded-lg border-0 sm:flex-none">
                  Kanban
                </ToggleGroupItem>
                <ToggleGroupItem value="lista" aria-label="Visualização em lista" className="flex-1 rounded-lg border-0 sm:flex-none">
                  Lista
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <FilterField label="Responsável">
                  <Select value={page.selectedResponsavelId} onValueChange={page.setSelectedResponsavelId}>
                    <SelectTrigger size="sm" className="w-full rounded-lg border-slate-200 bg-white shadow-none">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="all">Todos</SelectItem>
                      {page.responsaveis.map(responsavel => (
                        <SelectItem key={responsavel.id} value={responsavel.id}>
                          {responsavel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>

                <FilterField label="Fluxo">
                  <WorkflowTreeFilter
                    nodes={page.workflowNodes}
                    selectedNodeIds={page.selectedWorkflowNodeIds}
                    onSelectedNodeIdsChange={page.setSelectedWorkflowNodeIds}
                  />
                </FilterField>

                <FilterField label="Valor mínimo">
                  <Input
                    inputMode="decimal"
                    value={page.valorEstimadoMin}
                    onChange={event => page.setValorEstimadoMin(event.target.value)}
                    placeholder={page.valueRange.min ? `Desde ${formatCurrencyLabel(page.valueRange.min)}` : "R$ 0,00"}
                    className="h-9 rounded-lg border-slate-200 bg-white shadow-none"
                  />
                </FilterField>

                <FilterField label="Valor máximo">
                  <Input
                    inputMode="decimal"
                    value={page.valorEstimadoMax}
                    onChange={event => page.setValorEstimadoMax(event.target.value)}
                    placeholder={page.valueRange.max ? `Até ${formatCurrencyLabel(page.valueRange.max)}` : "Sem limite"}
                    className="h-9 rounded-lg border-slate-200 bg-white shadow-none"
                  />
                </FilterField>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="justify-start rounded-xl px-3 text-secondary hover:bg-sky-50 hover:text-secondary"
                onClick={page.clearFilters}
                disabled={!page.hasActiveFilters}
              >
                <RotateCcw className="mr-2 size-4" />
                Limpar Filtros
              </Button>

              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 lg:inline-flex">
                <ListFilter className="size-4" />
                {page.total} oportunidade{page.total === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {page.isLoading ? (
        <Card className="rounded-[1.35rem]">
          <CardContent className="flex min-h-[380px] flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="size-8 animate-spin text-secondary" />
            <p className="font-medium text-muted-foreground">Carregando fluxo e oportunidades...</p>
          </CardContent>
        </Card>
      ) : page.items.length === 0 ? (
        <Card className="rounded-[1.35rem]">
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <Target className="size-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-primary">{page.emptyState}</p>
              <p className="max-w-xl text-sm text-muted-foreground">
                Cadastre uma oportunidade para começar a acompanhar a operação do time no board.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`${base}/licitacoes/nova`}>
                <Plus className="mr-2 size-4" />
                Nova Oportunidade
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : page.viewMode === "kanban" ? (
        <OportunidadesKanbanView
          phases={page.phases}
          items={page.items}
          columnSummaries={page.columnSummaries}
          isMoving={page.isMoving}
          movingOportunidadeId={page.movingOportunidadeId}
          getMoveOptions={page.getMoveOptions}
          onMoveToNode={page.moveToNode}
          onMoveToPhase={page.moveToPhase}
          onCreateComment={(item, content) => page.createBoardNote({
            oportunidadeId: item.oportunidadeId,
            content,
          })}
          creatingCommentOportunidadeId={page.creatingCommentOportunidadeId}
          onOpenDetail={item => {
            page.openDetail(item)
            router.replace(`${licitacoesHref}?oportunidadeId=${item.oportunidadeId}`, { scroll: false })
          }}
        />
      ) : (
        <OportunidadesListView
          items={page.items}
          movingOportunidadeId={page.movingOportunidadeId}
          getMoveOptions={page.getMoveOptions}
          onMoveToNode={page.moveToNode}
          onOpenDetail={item => {
            page.openDetail(item)
            router.replace(`${licitacoesHref}?oportunidadeId=${item.oportunidadeId}`, { scroll: false })
          }}
        />
      )}

      <OportunidadeDetailDialog
        open={page.isDetailOpen}
        onOpenChange={open => {
          if (!open) {
            page.closeDetail()
            router.replace(licitacoesHref, { scroll: false })
          }
        }}
        item={page.selectedDetailItem}
        workspace={page.detailWorkspace}
        isLoading={page.isDetailLoading}
        errorMessage={detailErrorMessage}
        moveOptions={page.selectedDetailItem ? page.getMoveOptions(page.selectedDetailItem) : []}
        isMoving={page.movingOportunidadeId === page.selectedDetailItem?.oportunidadeId}
        isUpdating={page.isUpdatingDetail}
        isUpdatingItem={page.isUpdatingDetailItems}
        responsavelOptions={page.responsavelOptions}
        workflowNodes={page.workflowNodes}
        workflowMetadata={page.workflowMetadata}
        onQuickUpdate={page.updateDetailItem}
        onUpdateItem={page.updateDetailWorkspaceItem}
        onCreateItem={page.createDetailWorkspaceItem}
        onDeleteItem={page.deleteDetailWorkspaceItem}
        onMove={targetNodeId => page.selectedDetailItem
          ? page.moveToNode({
            oportunidadeId: page.selectedDetailItem.oportunidadeId,
            targetNodeId,
          })
          : Promise.resolve()}
        workspaceHref={detailWorkspaceHref}
      />
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function formatCurrencyLabel(value: string) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(numericValue)
}
