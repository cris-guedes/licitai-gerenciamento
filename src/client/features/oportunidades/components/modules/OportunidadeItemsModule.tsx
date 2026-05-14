"use client"

import { Badge } from "@/client/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table"
import { WorkspaceMetricCard, WorkspaceMetricGrid, WorkspacePanel } from "@/client/components/workspace"
import { formatCurrency } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeItemsModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const itens = workspace.licitacaoWorkspace?.edital?.itens ?? []
  const totalEstimado = itens.reduce((sum, item) => sum + toNumber(item.valorTotalEstimado), 0)
  const lotes = new Set(itens.map(item => item.lote).filter(Boolean)).size
  const itensComValor = itens.filter(item => item.valorUnitarioEstimado || item.valorTotalEstimado).length

  return (
    <WorkspacePanel
      title="Itens licitados"
      description="Tabela de itens, quantidades, unidades, lotes e valores estimados do edital."
      actions={
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
          {itens.length} item{itens.length === 1 ? "" : "s"}
        </Badge>
      }
    >
      <div className="space-y-5">
        <WorkspaceMetricGrid className="xl:grid-cols-4">
          <WorkspaceMetricCard label="Itens" value={String(itens.length)} valueClassName="text-base" description="Linhas do edital" />
          <WorkspaceMetricCard label="Lotes" value={String(lotes)} valueClassName="text-base" description="Lotes identificados" />
          <WorkspaceMetricCard label="Com valor" value={String(itensComValor)} valueClassName="text-base" description="Itens precificados" />
          <WorkspaceMetricCard label="Total estimado" value={formatCurrency(String(totalEstimado)) ?? "A definir"} valueClassName="text-base" description="Soma dos itens" />
        </WorkspaceMetricGrid>

        {itens.length ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="w-[34%] min-w-[300px]">Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor unit.</TableHead>
                  <TableHead>Valor total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.numeroItem ?? index + 1}</TableCell>
                    <TableCell>{item.lote || "-"}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="space-y-2">
                        <p className="font-medium text-primary">{item.descricao || "Item sem descrição"}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {item.codigoCatmatCatser ? <span className="rounded-full bg-slate-100 px-2 py-1">CATMAT/CATSER {item.codigoCatmatCatser}</span> : null}
                          {item.codigoNcmNbs ? <span className="rounded-full bg-slate-100 px-2 py-1">NCM/NBS {item.codigoNcmNbs}</span> : null}
                          {item.criterioJulgamentoItem ? <span className="rounded-full bg-slate-100 px-2 py-1">{item.criterioJulgamentoItem}</span> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatItemType(item.tipoItem)}</TableCell>
                    <TableCell>{formatNumber(item.quantidadeTotal)}</TableCell>
                    <TableCell>{item.unidadeMedida || "-"}</TableCell>
                    <TableCell>{formatCurrency(item.valorUnitarioEstimado) ?? "-"}</TableCell>
                    <TableCell>{formatCurrency(item.valorTotalEstimado) ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
            Nenhum item foi consolidado para esta oportunidade.
          </div>
        )}
      </div>
    </WorkspacePanel>
  )
}

function toNumber(value: string | null) {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatNumber(value: string | null) {
  if (!value) return "-"
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return value
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(parsed)
}

function formatItemType(value: string | null) {
  const labels: Record<string, string> = {
    MATERIAL: "Material",
    SERVICO: "Serviço",
  }

  return value ? labels[value] ?? value : "-"
}
