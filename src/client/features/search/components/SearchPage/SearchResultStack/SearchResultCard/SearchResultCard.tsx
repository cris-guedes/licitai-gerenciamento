"use client"

import { useState } from "react"
import { MapPin, Clock, Copy, Check, ChevronDown, Loader2, Package } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { formatCurrency } from "@/client/main/lib/utils/format"
import { cn }             from "@/client/main/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/client/components/ui/collapsible"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import type { GetSegments }   from "../../../../services/search"
import { useProcurementItemsService } from "../../../../services/procurement"
import { useSearchResultCard } from "./hooks/useSearchResultCard"
import { HighlightText }      from "./HighlightText"
import { LicitacaoDetailSheet } from "../../../LicitacaoDetail"
import { ItemBadgesRow, SituacaoCell, CatmatCell, DescricaoCell } from "../../../ItemBadges"

const MATERIAL_LABELS: Record<string, string> = { M: "Material", S: "Serviço" }


const DOC_LABELS: Record<string, string> = {
  edital:          "Edital",
  aviso_licitacao: "Aviso de Licitação",
  dispensa:        "Dispensa",
  inexigibilidade: "Inexigibilidade",
  contrato:        "Contrato",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      title="Copiar"
    >
      {copied
        ? <Check className="size-3 text-green-500" />
        : <Copy className="size-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
      }
    </button>
  )
}

interface Props {
  item:         LicitacaoItem
  getSegments?: GetSegments
}

export function SearchResultCard({ item, getSegments }: Props) {
  const api = useCoreApi()
  const procurementItemsService = useProcurementItemsService(api)
  const {
    sheetOpen,
    setSheetOpen,
    itemsExpanded,
    setItemsExpanded,
    itemsQuery,
    docLabel,
    editTitle,
    location,
    fimDate,
    urgency,
    deadlineLabel,
  } = useSearchResultCard(item, { procurementItemsService })

  const seg = getSegments ?? ((_f: string, text: string) => [{ text, highlighted: false }])

  return (
    <div className={cn(
      "flex flex-col bg-background border border-border/50 rounded-lg overflow-hidden",
      "transition-colors hover:border-border cursor-pointer",
      item.cancelado && "opacity-50"
    )}
      onClick={() => setSheetOpen(true)}
    >
      <div className="px-5 py-4 flex flex-col gap-2">

        {/* Row 1 — meta: tipo · modalidade · status · localização */}
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            {docLabel && <span className="font-semibold text-foreground/70">{docLabel}</span>}
            {docLabel && item.modalidade_licitacao_nome && <span className="opacity-30">·</span>}
            {item.modalidade_licitacao_nome && <span>{item.modalidade_licitacao_nome}</span>}
            {item.cancelado && <><span className="opacity-30">·</span><span className="text-destructive font-semibold">Cancelado</span></>}
          </div>
          {location && (
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="size-3 opacity-50" />
              {location}
            </span>
          )}
        </div>

        {/* Row 2 — edital number title */}
        <h3 className="text-sm font-semibold leading-snug text-foreground">
          {editTitle ?? (item.document_type ? (DOC_LABELS[item.document_type] ?? item.document_type) : "Sem título")}
        </h3>

        {/* Row 3 — objeto (title) */}
        {item.title && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 border-l-2 border-border pl-3">
            <HighlightText segments={seg("title", item.title)} />
          </p>
        )}

        {/* Row 3b — description with highlights */}
        {item.description && (
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-2 border-l-2 border-border/40 pl-3 italic">
            <HighlightText segments={seg("description", item.description)} />
          </p>
        )}

        {/* Row 4 — org + meta right */}
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="truncate">
            <HighlightText segments={seg("orgao_nome", item.orgao_nome ?? "—")} />
          </span>
          <div className="flex items-center gap-3 shrink-0">
            {item.valor_global != null && (
              <span className="font-semibold text-foreground/80">{formatCurrency(item.valor_global)}</span>
            )}
            {fimDate && (
              <span className={cn("flex items-center gap-1", urgency ?? "text-muted-foreground")}>
                <Clock className="size-3 opacity-60" />
                {fimDate}
                {deadlineLabel && (
                  <span className="font-semibold">({deadlineLabel})</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Row 4 — PNCP ID */}
        {item.numero_controle_pncp && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50" onClick={e => e.stopPropagation()}>
            <span>{item.numero_controle_pncp}</span>
            <CopyButton text={item.numero_controle_pncp} />
          </div>
        )}

      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded} className="w-full">
        <div
          className="px-5 py-2 flex items-center justify-between border-t border-border/30 bg-muted/20"
          onClick={e => e.stopPropagation()}
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package className="size-3.5" />
              {itemsExpanded ? "Ocultar itens" : "Ver itens"}
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", itemsExpanded && "-rotate-180")} />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <SearchCardItemsContent itemsQuery={itemsQuery} />
        </CollapsibleContent>
      </Collapsible>

      <LicitacaoDetailSheet item={item} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}

function SearchCardItemsContent({ itemsQuery }: { itemsQuery: ReturnType<typeof useSearchResultCard>["itemsQuery"] }) {

  return (
    <div className="border-t border-border/20 bg-muted/10">
      {itemsQuery.isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center py-5">
          <Loader2 className="size-3.5 animate-spin" /> Carregando itens...
        </div>
      )}
      {itemsQuery.isError && (
        <p className="text-xs text-destructive py-3 text-center">Erro ao carregar itens</p>
      )}
      {itemsQuery.data?.items.length === 0 && (
        <p className="text-xs text-muted-foreground py-3 text-center">Nenhum item encontrado.</p>
      )}
      {itemsQuery.data && itemsQuery.data.items.length > 0 && (
        <div className="overflow-x-auto max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground border-b border-border/40">
                <th className="text-left px-4 py-2 font-semibold w-8">#</th>
                <th className="text-left px-4 py-2 font-semibold">Descrição</th>
                <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">Situação</th>
                <th className="text-right px-4 py-2 font-semibold">Tipo</th>
                <th className="text-left px-4 py-2 font-semibold whitespace-nowrap">CATMAT/CATSER</th>
                <th className="text-right px-4 py-2 font-semibold">Qtd</th>
                <th className="text-right px-4 py-2 font-semibold">Vl. Unit.</th>
                <th className="text-right px-4 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 bg-background">
              {itemsQuery.data.items.map((it, i) => (
                <tr key={it.numeroItem ?? i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2 text-muted-foreground">{it.numeroItem ?? i + 1}</td>
                  <td className="px-4 py-2 max-w-xs">
                    <ItemBadgesRow it={it} />
                    <DescricaoCell it={it} lineClamp={2} />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <SituacaoCell it={it} />
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground italic whitespace-nowrap">
                    {it.materialOuServicoNome ?? (it.materialOuServico ? (MATERIAL_LABELS[it.materialOuServico] ?? it.materialOuServico) : "—")}
                  </td>
                  <td className="px-4 py-2">
                    <CatmatCell it={it} />
                  </td>
                  <td className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                    {it.quantidade != null ? it.quantidade.toLocaleString("pt-BR") : "—"}
                    {it.unidadeMedida && <span className="text-muted-foreground font-normal ml-1">{it.unidadeMedida}</span>}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground whitespace-nowrap">
                    {it.valorUnitarioEstimado != null ? formatCurrency(it.valorUnitarioEstimado) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-primary whitespace-nowrap">
                    {it.valorTotal != null ? formatCurrency(it.valorTotal) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
