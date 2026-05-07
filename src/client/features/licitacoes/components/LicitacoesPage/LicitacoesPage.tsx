"use client"

import Link from "next/link"
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
import { OportunidadesKanbanView } from "./OportunidadesKanbanView"
import { OportunidadesListView } from "./OportunidadesListView"
import { useLicitacoesPage } from "./hooks/useLicitacoesPage"

export function LicitacoesPage() {
  const api = useCoreApi()
  const { empresaAtiva, orgAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const page = useLicitacoesPage({
    licitacaoService,
    companyId: empresaAtiva?.id ?? null,
  })
  const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

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
        <div className="flex justify-end">
          <ToggleGroup
            type="single"
            value={page.viewMode}
            onValueChange={(value) => {
              if (value === "kanban" || value === "lista") {
                page.setViewMode(value)
              }
            }}
            variant="outline"
            className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            >
              <ToggleGroupItem value="kanban" aria-label="Visualização em kanban" className="rounded-lg border-0">
                Kanban
            </ToggleGroupItem>
            <ToggleGroupItem value="lista" aria-label="Visualização em lista" className="rounded-lg border-0">
              Lista
            </ToggleGroupItem>
            </ToggleGroup>
          </div>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] p-4 shadow-[0_18px_40px_rgba(4,22,39,0.05)]">
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={page.search}
                onChange={event => page.setSearch(event.target.value)}
                placeholder="Buscar por nome ou número do processo..."
                className="h-12 rounded-xl border-slate-200 bg-white pl-11 text-[0.95rem] shadow-none"
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Select value={page.selectedResponsavelId} onValueChange={page.setSelectedResponsavelId}>
                  <SelectTrigger size="sm" className="min-w-[180px] rounded-xl border-slate-200 bg-white shadow-none">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">Responsável</SelectItem>
                    {page.responsaveis.map(responsavel => (
                      <SelectItem key={responsavel.id} value={responsavel.id}>
                        {responsavel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={page.selectedPhaseId} onValueChange={page.setSelectedPhaseId}>
                  <SelectTrigger size="sm" className="min-w-[180px] rounded-xl border-slate-200 bg-white shadow-none">
                    <SelectValue placeholder="Tipo de Pregão" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">Tipo de Pregão</SelectItem>
                    {page.phases.map(phase => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={page.selectedSituationId} onValueChange={page.setSelectedSituationId}>
                  <SelectTrigger size="sm" className="min-w-[180px] rounded-xl border-slate-200 bg-white shadow-none">
                    <SelectValue placeholder="Situação" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">Situação</SelectItem>
                    {page.situations.map(situation => (
                      <SelectItem key={situation.id} value={situation.id}>
                        {situation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <p className="font-medium text-muted-foreground">Carregando workflow e oportunidades...</p>
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
          isMoving={page.isMoving}
          movingOportunidadeId={page.movingOportunidadeId}
          getMoveOptions={page.getMoveOptions}
          getReachableNodeForPhase={page.getReachableNodeForPhase}
          onMoveToNode={page.moveToNode}
          onMoveToPhase={page.moveToPhase}
        />
      ) : (
        <OportunidadesListView
          items={page.items}
          movingOportunidadeId={page.movingOportunidadeId}
          getMoveOptions={page.getMoveOptions}
          onMoveToNode={page.moveToNode}
        />
      )}
    </div>
  )
}
