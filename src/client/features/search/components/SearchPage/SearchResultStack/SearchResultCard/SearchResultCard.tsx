"use client"

import { useState, type ElementType, type ReactNode } from "react"
import {
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Package,
} from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/client/components/ui/collapsible"
import { formatCurrency } from "@/client/main/lib/utils/format"
import { cn } from "@/client/main/lib/utils"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import type { GetSegments } from "../../../../services/search"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useProcurementItemsService } from "../../../../services/procurement"
import { buildPncpUrl } from "../../../../utils/urls"
import { ItemBadgesRow, SituacaoCell, CatmatCell, DescricaoCell } from "../../../ItemBadges"
import { LicitacaoDetailSheet } from "../../../LicitacaoDetail"
import { HighlightText } from "./HighlightText"
import { useSearchResultCard } from "./hooks/useSearchResultCard"

const MATERIAL_LABELS: Record<string, string> = { M: "Material", S: "Serviço" }

const DOC_LABELS: Record<string, string> = {
  edital: "Edital",
  aviso_licitacao: "Aviso",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
  contrato: "Contrato",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation()
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-muted-foreground hover:text-foreground"
      title="Copiar"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  )
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: ElementType
  children: ReactNode
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  )
}

function getStatusLabel(item: LicitacaoItem) {
  if (item.cancelado) return "Cancelada"
  return item.situacao_nome ?? "Aberta"
}

function getStatusClass(item: LicitacaoItem) {
  const label = getStatusLabel(item).toLowerCase()

  if (item.cancelado || label.includes("cancel")) {
    return "border-destructive/20 bg-destructive/10 text-destructive"
  }

  if (label.includes("receb") || label.includes("abert")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (label.includes("julg") || label.includes("encerrada")) {
    return "border-blue-200 bg-blue-50 text-blue-700"
  }

  if (label.includes("susp")) {
    return "border-amber-200 bg-amber-50 text-amber-700"
  }

  return "border-border bg-muted text-muted-foreground"
}

interface Props {
  item: LicitacaoItem
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
    aberturaDate,
    encerramentoDate,
    publicacaoDate,
    openingLevel,
    closingLevel,
  } = useSearchResultCard(item, { procurementItemsService })

  const pncpUrl = buildPncpUrl(item)
  const seg = getSegments ?? ((_field: string, text: string) => [{ text, highlighted: false }])
  const primaryTitle = item.title || item.description || editTitle || "Oportunidade sem título"
  const secondaryDescription = item.description && item.description !== item.title ? item.description : null
  const documentLabel = item.document_type ? (DOC_LABELS[item.document_type] ?? docLabel ?? item.document_type) : docLabel

  return (
    <article
      className={cn(
        "group rounded-lg border border-border/70 bg-card transition-colors hover:border-primary/30",
        item.cancelado && "opacity-70"
      )}
      onClick={() => setSheetOpen(true)}
    >
      <div className="flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {editTitle ? <span className="font-medium text-foreground/80">{editTitle}</span> : null}
            {documentLabel ? <span>{documentLabel}</span> : null}
            {item.modalidade_licitacao_nome ? <span>{item.modalidade_licitacao_nome}</span> : null}
            {(() => {
              const status = getStatusLabel(item)
              // Oculta rótulos irrelevantes do tipo "Divulgada/Publicado no PNCP"
              if (/pncp/i.test(status)) return null
              return (
                <Badge variant="outline" className={cn("h-6 rounded-full px-2 text-[11px] font-medium", getStatusClass(item))}>
                  {status}
                </Badge>
              )
            })()}
          </div>

          {item.numero_controle_pncp ? (
            <div className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-mono">{item.numero_controle_pncp}</span>
              <CopyButton text={item.numero_controle_pncp} />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold leading-6 text-foreground md:text-[15px]">
            <HighlightText segments={seg("title", primaryTitle)} />
          </h3>
          {secondaryDescription ? (
            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              <HighlightText segments={seg("description", secondaryDescription)} />
            </p>
          ) : null}
        </div>

        <div className="grid gap-x-5 gap-y-2 md:grid-cols-[minmax(220px,1.3fr)_repeat(3,minmax(130px,auto))]">
          {item.orgao_nome ? (
            <MetaItem icon={Building2}>
              <HighlightText segments={seg("orgao_nome", item.orgao_nome)} />
            </MetaItem>
          ) : null}
          {location ? <MetaItem icon={MapPin}>{location}</MetaItem> : null}
          {item.valor_global != null ? (
            <MetaItem icon={CircleDollarSign}>{formatCurrency(item.valor_global)}</MetaItem>
          ) : null}
          {aberturaDate ? (
            <MetaItem icon={CalendarClock}>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  openingLevel === 2
                    ? "text-emerald-700/80"
                    : openingLevel === 1
                      ? "text-emerald-600/70"
                      : "text-muted-foreground"
                )}
              >
                {`Abre ${aberturaDate}`}
              </span>
            </MetaItem>
          ) : null}
          {encerramentoDate ? (
            <MetaItem icon={CalendarClock}>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  closingLevel === 2
                    ? "text-red-700/80"
                    : closingLevel === 1
                      ? "text-red-600/70"
                      : "text-muted-foreground"
                )}
              >
                {`Encerra ${encerramentoDate}`}
              </span>
            </MetaItem>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {publicacaoDate ? <span>Publicado em {publicacaoDate}</span> : null}
            {item.unidade_nome ? (
              <span className="truncate">Unidade: {item.unidade_nome}</span>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={event => event.stopPropagation()}
                >
                  <Package data-icon="inline-start" />
                  {itemsExpanded ? "Ocultar itens" : "Ver itens"}
                  <ChevronDown
                    data-icon="inline-end"
                    className={cn("transition-transform", itemsExpanded && "rotate-180")}
                  />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={event => {
                event.stopPropagation()
                setSheetOpen(true)
              }}
            >
              <Eye data-icon="inline-start" />
              Detalhes
            </Button>
            {pncpUrl ? (
              <Button asChild size="sm">
                <a
                  href={pncpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={event => event.stopPropagation()}
                >
                  <ExternalLink data-icon="inline-start" />
                  Acessar edital
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Collapsible open={itemsExpanded} onOpenChange={setItemsExpanded}>
        <CollapsibleContent onClick={event => event.stopPropagation()}>
          <SearchCardItemsContent itemsQuery={itemsQuery} />
        </CollapsibleContent>
      </Collapsible>

      <LicitacaoDetailSheet item={item} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </article>
  )
}

function SearchCardItemsContent({ itemsQuery }: { itemsQuery: ReturnType<typeof useSearchResultCard>["itemsQuery"] }) {
  return (
    <div className="border-t border-border/60 bg-muted/20">
      {itemsQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Carregando itens...
        </div>
      ) : null}
      {itemsQuery.isError ? (
        <p className="py-4 text-center text-xs text-destructive">Erro ao carregar itens</p>
      ) : null}
      {itemsQuery.data?.items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
          <FileText className="size-4" />
          Nenhum item encontrado.
        </div>
      ) : null}
      {itemsQuery.data && itemsQuery.data.items.length > 0 ? (
        <div className="max-h-[280px] overflow-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50 text-muted-foreground">
                <th className="w-8 px-4 py-2 text-left font-semibold">#</th>
                <th className="px-4 py-2 text-left font-semibold">Descrição</th>
                <th className="px-4 py-2 text-left font-semibold">Situação</th>
                <th className="px-4 py-2 text-right font-semibold">Tipo</th>
                <th className="px-4 py-2 text-left font-semibold">CATMAT/CATSER</th>
                <th className="px-4 py-2 text-right font-semibold">Qtd</th>
                <th className="px-4 py-2 text-right font-semibold">Vl. Unit.</th>
                <th className="px-4 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 bg-card">
              {itemsQuery.data.items.map((it, index) => (
                <tr key={it.numeroItem ?? index} className="hover:bg-muted/30">
                  <td className="px-4 py-2 text-muted-foreground">{it.numeroItem ?? index + 1}</td>
                  <td className="max-w-xs px-4 py-2">
                    <ItemBadgesRow it={it} />
                    <DescricaoCell it={it} lineClamp={2} />
                  </td>
                  <td className="px-4 py-2">
                    <SituacaoCell it={it} />
                  </td>
                  <td className="px-4 py-2 text-right italic text-muted-foreground">
                    {it.materialOuServicoNome ?? (it.materialOuServico ? (MATERIAL_LABELS[it.materialOuServico] ?? it.materialOuServico) : "—")}
                  </td>
                  <td className="px-4 py-2">
                    <CatmatCell it={it} />
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {it.quantidade != null ? it.quantidade.toLocaleString("pt-BR") : "—"}
                    {it.unidadeMedida ? <span className="ml-1 font-normal text-muted-foreground">{it.unidadeMedida}</span> : null}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    {it.valorUnitarioEstimado != null ? formatCurrency(it.valorUnitarioEstimado) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-primary">
                    {it.valorTotal != null ? formatCurrency(it.valorTotal) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
