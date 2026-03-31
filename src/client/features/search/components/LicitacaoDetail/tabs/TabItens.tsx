"use client"

import React, { useState } from "react"
import { ChevronDown, ExternalLink, Package } from "lucide-react"
import { formatCurrency } from "@/client/main/lib/utils/format"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import {
  CatmatCell,
  DescricaoCell,
  ItemBadgesRow,
  PorteCell,
  SituacaoCell,
  SituacaoResultadoCell,
} from "../../ItemBadges"
import { useProcurementService } from "../../../services/procurement"
import { buildCnpjBizUrl, buildSancoesUrl } from "../../../utils/urls"
import { MATERIAL_LABELS } from "../constants"
import { EmptyState, LoadingState, SectionTitle } from "../shared"

function ItemResultsExpandedRow({
  itemResults,
  item,
  numeroItem,
  colSpan,
}: {
  itemResults: ReturnType<typeof useProcurementService>["itemResults"]
  item: LicitacaoItem
  numeroItem: number
  colSpan: number
}) {
  const query = itemResults.get({ item, numeroItem, enabled: true })

  return (
    <tr>
      <td colSpan={colSpan} className="px-0 py-0">
        <div className="bg-muted/20 border-t border-border/30 px-6 py-3">
          {query.isLoading && <LoadingState text="Carregando resultados..." />}
          {query.isError && <p className="text-xs text-destructive py-1">Erro ao carregar resultados.</p>}
          {!query.isLoading && query.data?.results.length === 0 && (
            <p className="text-xs text-muted-foreground py-1">Nenhum resultado registrado para este item.</p>
          )}
          {query.data && query.data.results.length > 0 && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/30">
                  <th className="text-left py-1.5 pr-4 font-semibold">Fornecedor</th>
                  <th className="text-left py-1.5 pr-4 font-semibold">Porte</th>
                  <th className="text-right py-1.5 pr-4 font-semibold">Qtd. Homologada</th>
                  <th className="text-right py-1.5 pr-4 font-semibold">Vl. Unit. Homologado</th>
                  <th className="text-right py-1.5 pr-4 font-semibold">Total Homologado</th>
                  <th className="text-left py-1.5 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {query.data.results.map((result, index) => {
                  const cnpjUrl = buildCnpjBizUrl(result.niFornecedor)
                  const sancoesUrl = buildSancoesUrl(result.niFornecedor)

                  return (
                    <tr key={result.sequencialResultado ?? index} className="hover:bg-muted/30">
                      <td className="py-2 pr-4">
                        {cnpjUrl ? (
                          <a href={cnpjUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline underline-offset-2 transition-colors w-fit block">
                            {result.nomeRazaoSocialFornecedor ?? "—"}
                          </a>
                        ) : (
                          <span className="font-medium">{result.nomeRazaoSocialFornecedor ?? "—"}</span>
                        )}
                        {result.niFornecedor && <span className="block text-[10px] text-muted-foreground font-mono">{result.niFornecedor}</span>}
                        {result.aplicacaoBeneficioMeEpp && (
                          <span className="inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                            ME/EPP
                          </span>
                        )}
                        {sancoesUrl && (
                          <a
                            href={sancoesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 mt-1 text-[9px] text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
                          >
                            Consultar sanções <ExternalLink size={8} className="shrink-0" />
                          </a>
                        )}
                      </td>
                      <td className="py-2 pr-4"><PorteCell nome={result.porteFornecedorNome} /></td>
                      <td className="py-2 pr-4 text-right font-semibold">
                        {result.quantidadeHomologada != null ? result.quantidadeHomologada.toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">
                        {result.valorUnitarioHomologado != null ? formatCurrency(result.valorUnitarioHomologado) : "—"}
                        {result.percentualDesconto != null && result.percentualDesconto > 0 && (
                          <span className="block text-[10px] text-emerald-600">{result.percentualDesconto.toFixed(2)}% desc.</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {result.valorTotalHomologado != null ? formatCurrency(result.valorTotalHomologado) : "—"}
                      </td>
                      <td className="py-2"><SituacaoResultadoCell nome={result.situacaoCompraItemResultadoNome} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  )
}

type Props = {
  items: ReturnType<typeof useProcurementService>["items"]
  item: LicitacaoItem
  itemResults: ReturnType<typeof useProcurementService>["itemResults"]
}

export function TabItens({ items: query, item, itemResults }: Props) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleItem = (num: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      return next
    })
  }

  return (
    <div className="flex flex-col flex-1">
      <SectionTitle>Itens da Licitação{query.data?.total ? ` (${query.data.total})` : ""}</SectionTitle>
      {query.isLoading && <LoadingState text="Carregando itens..." />}
      {query.isError && <p className="text-sm text-destructive text-center py-4">Erro ao carregar itens.</p>}
      {query.data?.items.length === 0 && <EmptyState icon={Package} text="Nenhum item encontrado." />}
      {query.data && query.data.items.length > 0 && (
        <div className="rounded-xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground border-b border-border/40">
                  <th className="w-8 px-3 py-2.5" />
                  <th className="text-left px-3 py-2.5 font-semibold w-10">#</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Descrição</th>
                  <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">Situação</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Tipo</th>
                  <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">CATMAT/CATSER</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Qtd</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Un.</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Vl. Unit.</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {query.data.items.map((it: any, index: number) => {
                  const num = it.numeroItem ?? index + 1
                  const isExpanded = expandedItems.has(num)

                  return (
                    <React.Fragment key={num}>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2.5 w-8">
                          <button
                            type="button"
                            onClick={() => toggleItem(num)}
                            className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            title={isExpanded ? "Ocultar resultados" : "Ver resultados"}
                          >
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{num}</td>
                        <td className="px-3 py-2.5 max-w-xs">
                          <ItemBadgesRow it={it} />
                          <DescricaoCell it={it} lineClamp={3} />
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap"><SituacaoCell it={it} /></td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground italic whitespace-nowrap">
                          {it.materialOuServicoNome ?? (it.materialOuServico ? (MATERIAL_LABELS[it.materialOuServico] ?? it.materialOuServico) : "—")}
                        </td>
                        <td className="px-3 py-2.5"><CatmatCell it={it} /></td>
                        <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                          {it.quantidade != null ? it.quantidade.toLocaleString("pt-BR") : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">{it.unidadeMedida ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                          {it.valorUnitarioEstimado != null ? formatCurrency(it.valorUnitarioEstimado) : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-primary whitespace-nowrap">
                          {it.valorTotal != null ? formatCurrency(it.valorTotal) : "—"}
                        </td>
                      </tr>
                      {isExpanded && (
                        <ItemResultsExpandedRow itemResults={itemResults} item={item} numeroItem={num} colSpan={10} />
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
