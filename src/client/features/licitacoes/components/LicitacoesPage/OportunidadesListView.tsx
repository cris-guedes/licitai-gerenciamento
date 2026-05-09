"use client"

import { Building2, CalendarClock, Layers3 } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table"
import type { OportunidadeBoardItem } from "../../services/use-licitacao.service"
import { OportunidadeWorkflowActions } from "./OportunidadeWorkflowActions"

function formatDate(date: string | null) {
  if (!date) return "Sem data"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

function initials(name: string | undefined) {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function OportunidadesListView({
  items,
  movingOportunidadeId,
  getMoveOptions,
  onMoveToNode,
  onOpenDetail,
}: {
  items: OportunidadeBoardItem[]
  movingOportunidadeId: string | null
  getMoveOptions: (item: OportunidadeBoardItem) => Array<{
    nodeId: string
    label: string
    transitionType: string | null
    phaseId: string | null
    phaseLabel: string | null
  }>
  onMoveToNode: (params: { oportunidadeId: string; targetNodeId: string }) => Promise<void>
  onOpenDetail: (item: OportunidadeBoardItem) => void
}) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_14px_34px_rgba(4,22,39,0.05)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/90">
            <TableHead className="pl-5">Oportunidade</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Última movimentação</TableHead>
            <TableHead className="w-[150px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.oportunidadeId}
              role="button"
              tabIndex={0}
              onClick={() => onOpenDetail(item)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                onOpenDetail(item)
              }}
              className="cursor-pointer"
            >
              <TableCell className="pl-5 align-top">
                <div className="min-w-[280px]">
                  <p className="font-semibold text-primary">{item.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="size-3.5" />
                    <span className="line-clamp-1">{item.orgaoNome ?? "Órgão não identificado"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {[item.modalidade, item.numero].filter(Boolean).join(" · ") || "Oportunidade captada"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="align-top">
                {item.workflow.phase ? (
                  <Badge variant="outline" className="rounded-full bg-slate-50 text-slate-700">
                    {item.workflow.phase.label}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Sem fase</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col gap-2">
                  {item.workflow.status ? (
                    <Badge variant="secondary" className="rounded-full bg-sky-100 text-sky-800">
                      {item.workflow.status.label}
                    </Badge>
                  ) : null}
                  {item.workflow.situation ? (
                    <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                      {item.workflow.situation.label}
                    </Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex min-w-[180px] items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(item.responsavel?.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">
                      {item.responsavel?.name ?? "Sem responsável"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.responsavel?.email ?? "Aguardando atribuição"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <Layers3 className="size-4 text-slate-400" />
                  {item.itemCount}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <CalendarClock className="size-4 text-slate-400" />
                  {formatDate(item.workflow.updatedAt ?? item.updatedAt)}
                </div>
              </TableCell>
              <TableCell
                className="align-top text-right"
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
                onKeyDown={event => event.stopPropagation()}
              >
                <OportunidadeWorkflowActions
                  item={item}
                  moveOptions={getMoveOptions(item)}
                  isMoving={movingOportunidadeId === item.oportunidadeId}
                  onMove={(targetNodeId) => onMoveToNode({
                    oportunidadeId: item.oportunidadeId,
                    targetNodeId,
                  })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
