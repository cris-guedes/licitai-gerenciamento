"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Switch } from "@/client/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { Textarea } from "@/client/components/ui/textarea"
import type { OportunidadeWorkspaceItem, UpdateOportunidadeItemPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
import { cn } from "@/client/main/lib/utils"
import { formatCurrency } from "../../lib/oportunidade-workspace"

type DraftState = {
  companyItemId: string
  isSelected: boolean
  status: OportunidadeWorkspaceItem["status"]
  observacaoInterna: string
  quantidadeCotada: string
  quantidadeAdesao: string
  precoOfertaUnitario: string
  custoUnitarioSnapshot: string
  valorMinimoLance: string
  ofertaMarca: string
  ofertaModelo: string
  garantiaDescricao: string
  ultimoLance: string
  dataUltimoLance: string
  situacaoDisputa: string
  observacaoOperacional: string
}

type Props = {
  open: boolean
  item: OportunidadeWorkspaceItem | null
  companyItems: Array<{
    id: string
    codigo: string
    descricao: string
    unidadeMedida: string
    precoReferencia?: number | null
  }>
  isPending: boolean
  onClose: () => void
  onSubmit: (data: UpdateOportunidadeItemPayload["data"]) => Promise<void>
}

const statusOptions: Array<{ value: OportunidadeWorkspaceItem["status"]; label: string }> = [
  { value: "PENDING_PRICING", label: "Pendente" },
  { value: "READY_FOR_BID", label: "Pronto para lance" },
  { value: "IN_BIDDING", label: "Em disputa" },
  { value: "WON", label: "Ganho" },
  { value: "LOST", label: "Perdido" },
  { value: "DISCARDED", label: "Descartado" },
]

export function OportunidadeItemPricingDialog({
  open,
  item,
  companyItems,
  isPending,
  onClose,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<DraftState>(() => createDraftState(item))
  const [catalogQuery, setCatalogQuery] = useState("")

  const filteredCompanyItems = useMemo(() => {
    const normalizedQuery = normalizeText(catalogQuery)
    if (!normalizedQuery) return companyItems

    return companyItems.filter(companyItem => {
      const haystack = normalizeText(`${companyItem.codigo} ${companyItem.descricao}`)
      return haystack.includes(normalizedQuery)
    })
  }, [catalogQuery, companyItems])
  const selectedCompanyItem = useMemo(() => {
    return companyItems.find(companyItem => companyItem.id === draft.companyItemId) ?? null
  }, [companyItems, draft.companyItemId])
  const quantidadeCotada = parseNumber(draft.quantidadeCotada || item?.quantidadeTotal || "")
  const precoOfertaUnitario = parseNumber(draft.precoOfertaUnitario)
  const custoUnitario = parseNumber(draft.custoUnitarioSnapshot)
  const ultimoLance = parseNumber(draft.ultimoLance)
  const totalCalculado = quantidadeCotada !== null && precoOfertaUnitario !== null
    ? quantidadeCotada * precoOfertaUnitario
    : null
  const margemUnit = precoOfertaUnitario !== null && custoUnitario !== null
    ? precoOfertaUnitario - custoUnitario
    : null
  const margemPercentual = margemUnit !== null && custoUnitario !== null && custoUnitario > 0
    ? (margemUnit / custoUnitario) * 100
    : null

  async function handleSubmit() {
    await onSubmit({
      companyItemId: draft.companyItemId || null,
      isSelected: draft.isSelected,
      status: draft.status,
      observacaoInterna: draft.observacaoInterna || null,
      pricing: {
        quantidadeCotada: draft.quantidadeCotada || null,
        quantidadeAdesao: draft.quantidadeAdesao || null,
        precoOfertaUnitario: draft.precoOfertaUnitario || null,
        custoUnitarioSnapshot: draft.custoUnitarioSnapshot || null,
        valorMinimoLance: draft.valorMinimoLance || null,
        ofertaMarca: draft.ofertaMarca || null,
        ofertaModelo: draft.ofertaModelo || null,
        garantiaDescricao: draft.garantiaDescricao || null,
      },
      disputa: {
        ultimoLance: draft.ultimoLance || null,
        dataUltimoLance: draft.dataUltimoLance || null,
        situacaoDisputa: draft.situacaoDisputa || null,
        observacaoOperacional: draft.observacaoOperacional || null,
      },
    })
  }

  function handleCompanyItemChange(nextCompanyItemId: string) {
    const resolvedId = nextCompanyItemId === "__empty" ? "" : nextCompanyItemId
    const resolvedItem = companyItems.find(companyItem => companyItem.id === resolvedId) ?? null

    setDraft(current => ({
      ...current,
      companyItemId: resolvedId,
      precoOfertaUnitario: current.precoOfertaUnitario || stringifyNullableNumber(resolvedItem?.precoReferencia),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-none overflow-y-auto sm:max-w-[1180px] lg:w-[calc(100vw-5rem)] xl:w-[1180px]">
        <DialogHeader>
          <DialogTitle>Precificação do item</DialogTitle>
          <DialogDescription>
            Vincule o item interno, defina a estratégia comercial e registre os dados de disputa deste item.
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">
                    Item {item.numeroItem ?? "-"} {item.lote ? `· Lote ${item.lote}` : ""}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">{item.descricao || "Item sem descrição"}</p>
                </div>
                <Badge variant="outline" className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", getStatusClassName(draft.status))}>
                  {statusOptions.find(option => option.value === draft.status)?.label ?? draft.status}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <SummaryMetric label="Qtd. edital" value={item.quantidadeTotal || "-"} />
                <SummaryMetric label="Estimado edital" value={formatCurrency(item.valorTotalEstimado) ?? "-"} />
                <SummaryMetric label="Total calculado" value={formatMoneyValue(totalCalculado)} emphasized />
                <SummaryMetric
                  label="Margem unitária"
                  value={margemUnit === null ? "-" : `${formatMoneyValue(margemUnit)}${margemPercentual !== null ? ` · ${formatPercent(margemPercentual)}` : ""}`}
                  tone={margemUnit !== null && margemUnit < 0 ? "danger" : "default"}
                />
              </div>
            </div>

            <Tabs defaultValue="mapping" className="gap-5">
              <TabsList
                
                className="w-full justify-start gap-6 rounded-none border-b border-slate-200 bg-transparent p-0"
              >
                <TabsTrigger value="mapping" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                  Vínculo e status
                </TabsTrigger>
                <TabsTrigger value="commercial" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                  Comercial
                </TabsTrigger>
                <TabsTrigger value="bidding" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                  Disputa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mapping" className="mt-0 space-y-5">
                <div className="grid gap-4 md:grid-cols-[140px_220px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <Label>Ativo</Label>
                    <div className="flex h-11 items-center rounded-xl border border-slate-200 px-4">
                      <Switch
                        checked={draft.isSelected}
                        onCheckedChange={checked => setDraft(current => ({ ...current, isSelected: checked }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={draft.status} onValueChange={(value: OportunidadeWorkspaceItem["status"]) => setDraft(current => ({ ...current, status: value }))}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-none">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Buscar item interno</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={catalogQuery}
                        onChange={event => setCatalogQuery(event.target.value)}
                        placeholder="Buscar por código ou descrição"
                        className="h-11 rounded-xl border-slate-200 bg-white pl-9 shadow-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                  <Field label="Item interno">
                    <Select value={draft.companyItemId || "__empty"} onValueChange={handleCompanyItemChange}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-none">
                        <SelectValue placeholder="Selecione um item do catálogo" />
                      </SelectTrigger>
                      <SelectContent align="start" className="max-h-80">
                        <SelectItem value="__empty">Sem vínculo</SelectItem>
                        {filteredCompanyItems.map(companyItem => (
                          <SelectItem key={companyItem.id} value={companyItem.id}>
                            {companyItem.codigo} · {companyItem.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Item selecionado
                    </p>
                    {selectedCompanyItem ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium text-slate-900">{selectedCompanyItem.codigo}</p>
                        <p className="text-sm leading-6 text-slate-600">{selectedCompanyItem.descricao}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Unidade: {selectedCompanyItem.unidadeMedida || "-"}</span>
                          <span>Preço ref.: {formatCurrency(stringifyNullableNumber(selectedCompanyItem.precoReferencia)) ?? "-"}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Vincule um item do catálogo para reaproveitar referência comercial e facilitar a precificação.
                      </p>
                    )}
                  </div>
                </div>

                <Field label="Observação interna">
                  <Textarea
                    value={draft.observacaoInterna}
                    onChange={event => setDraft(current => ({ ...current, observacaoInterna: event.target.value }))}
                    className="min-h-28"
                  />
                </Field>
              </TabsContent>

              <TabsContent value="commercial" className="mt-0 space-y-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Quantidade cotada">
                    <Input value={draft.quantidadeCotada} onChange={event => setDraft(current => ({ ...current, quantidadeCotada: event.target.value }))} />
                  </Field>
                  <Field label="Quantidade adesão">
                    <Input value={draft.quantidadeAdesao} onChange={event => setDraft(current => ({ ...current, quantidadeAdesao: event.target.value }))} />
                  </Field>
                  <Field label="Preço ofertado">
                    <Input value={draft.precoOfertaUnitario} onChange={event => setDraft(current => ({ ...current, precoOfertaUnitario: event.target.value }))} />
                  </Field>
                  <Field label="Preço de custo">
                    <Input value={draft.custoUnitarioSnapshot} onChange={event => setDraft(current => ({ ...current, custoUnitarioSnapshot: event.target.value }))} />
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryMetric label="Preço de referência" value={formatCurrency(stringifyNullableNumber(selectedCompanyItem?.precoReferencia)) ?? "-"} />
                  <SummaryMetric label="Total da oferta" value={formatMoneyValue(totalCalculado)} emphasized />
                  <SummaryMetric
                    label="Margem unitária"
                    value={margemUnit === null ? "-" : `${formatMoneyValue(margemUnit)}${margemPercentual !== null ? ` · ${formatPercent(margemPercentual)}` : ""}`}
                    tone={margemUnit !== null && margemUnit < 0 ? "danger" : "default"}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Valor mín. lance">
                    <Input value={draft.valorMinimoLance} onChange={event => setDraft(current => ({ ...current, valorMinimoLance: event.target.value }))} />
                  </Field>
                  <Field label="Marca ofertada">
                    <Input value={draft.ofertaMarca} onChange={event => setDraft(current => ({ ...current, ofertaMarca: event.target.value }))} />
                  </Field>
                  <Field label="Modelo ofertado">
                    <Input value={draft.ofertaModelo} onChange={event => setDraft(current => ({ ...current, ofertaModelo: event.target.value }))} />
                  </Field>
                  <Field label="Garantia">
                    <Input value={draft.garantiaDescricao} onChange={event => setDraft(current => ({ ...current, garantiaDescricao: event.target.value }))} />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="bidding" className="mt-0 space-y-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <Field label="Último lance">
                    <Input value={draft.ultimoLance} onChange={event => setDraft(current => ({ ...current, ultimoLance: event.target.value }))} />
                  </Field>
                  <Field label="Data último lance">
                    <Input type="date" value={draft.dataUltimoLance} onChange={event => setDraft(current => ({ ...current, dataUltimoLance: event.target.value }))} />
                  </Field>
                  <Field label="Situação da disputa">
                    <Input value={draft.situacaoDisputa} onChange={event => setDraft(current => ({ ...current, situacaoDisputa: event.target.value }))} />
                  </Field>
                  <SummaryMetric label="Último lance atual" value={formatMoneyValue(ultimoLance)} />
                </div>

                <Field label="Observação operacional">
                  <Textarea
                    value={draft.observacaoOperacional}
                    onChange={event => setDraft(current => ({ ...current, observacaoOperacional: event.target.value }))}
                    className="min-h-28"
                  />
                </Field>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isPending || !item}>
            {isPending ? "Salvando..." : "Salvar item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function createDraftState(item: OportunidadeWorkspaceItem | null): DraftState {
  return {
    companyItemId: item?.companyItem?.id ?? "",
    isSelected: item?.isSelected ?? true,
    status: item?.status ?? "PENDING_PRICING",
    observacaoInterna: item?.observacaoInterna ?? "",
    quantidadeCotada: item?.pricing?.quantidadeCotada ?? item?.quantidadeTotal ?? "",
    quantidadeAdesao: item?.pricing?.quantidadeAdesao ?? "",
    precoOfertaUnitario: item?.pricing?.precoOfertaUnitario ?? item?.companyItem?.precoReferencia ?? "",
    custoUnitarioSnapshot: item?.pricing?.custoUnitarioSnapshot ?? "",
    valorMinimoLance: item?.pricing?.valorMinimoLance ?? "",
    ofertaMarca: item?.pricing?.ofertaMarca ?? "",
    ofertaModelo: item?.pricing?.ofertaModelo ?? "",
    garantiaDescricao: item?.pricing?.garantiaDescricao ?? "",
    ultimoLance: item?.disputa?.ultimoLance ?? "",
    dataUltimoLance: normalizeDateInput(item?.disputa?.dataUltimoLance ?? ""),
    situacaoDisputa: item?.disputa?.situacaoDisputa ?? "",
    observacaoOperacional: item?.disputa?.observacaoOperacional ?? "",
  }
}

function normalizeDateInput(value: string) {
  if (!value) return ""
  return value.slice(0, 10)
}

function stringifyNullableNumber(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value)
}

function SummaryMetric({
  label,
  value,
  emphasized = false,
  tone = "default",
}: {
  label: string
  value: string
  emphasized?: boolean
  tone?: "default" | "danger"
}) {
  return (
    <div className={cn("rounded-xl border px-4 py-3", tone === "danger" ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={cn("mt-2 text-sm font-medium", emphasized ? "text-slate-950" : "text-slate-700", tone === "danger" && "text-rose-700")}>
        {value}
      </p>
    </div>
  )
}

function parseNumber(value: string) {
  if (!value) return null

  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

function formatMoneyValue(value: number | null) {
  if (value === null) return "-"
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100)
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function getStatusClassName(status: OportunidadeWorkspaceItem["status"]) {
  const tones: Record<OportunidadeWorkspaceItem["status"], string> = {
    PENDING_PRICING: "border-amber-200 bg-amber-50 text-amber-700",
    READY_FOR_BID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    IN_BIDDING: "border-blue-200 bg-blue-50 text-blue-700",
    WON: "border-emerald-200 bg-emerald-50 text-emerald-700",
    LOST: "border-rose-200 bg-rose-50 text-rose-700",
    DISCARDED: "border-slate-200 bg-slate-100 text-slate-600",
  }

  return tones[status]
}
