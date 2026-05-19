"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { Edit3, ExternalLink } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { Textarea } from "@/client/components/ui/textarea"
import { WorkspacePanel } from "@/client/components/workspace"
import type { UpdateOportunidadeDetailsPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
import { cn } from "@/client/main/lib/utils"
import { formatCurrency, formatDate, formatStatusLabel } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeDataModule({
  workspace,
  isUpdating = false,
  onUpdateDetails,
}: {
  workspace: OportunidadeWorkspaceModel
  isUpdating?: boolean
  onUpdateDetails?: (patch: Omit<UpdateOportunidadeDetailsPayload, "companyId" | "oportunidadeId">) => Promise<void>
}) {
  const { oportunidade, licitacaoWorkspace } = workspace
  const draftPreview = licitacaoWorkspace?.oportunidade.draftPreview ?? licitacaoWorkspace?.licitacao.draftPreview ?? null
  const licitacao = licitacaoWorkspace?.licitacao ?? null
  const edital = licitacaoWorkspace?.edital ?? null
  const itemCount = edital?.itens.length ?? oportunidade.itemCount
  const valorEstimadoDisplay = formatCurrency(edital?.valorEstimado ?? licitacao?.valorEstimadoTotal ?? oportunidade.valorEstimado) ?? "Não informado"
  const valorHomologadoDisplay = formatCurrency(licitacao?.valorHomologadoTotal ?? null) ?? "Não informado"
  const localizacao = formatLocation(edital?.municipio, edital?.uf)
  const [dialogOpen, setDialogOpen] = useState(false)
  const initialForm = useMemo(() => {
    return {
      numero: oportunidade.numero ?? edital?.numero ?? licitacao?.numeroLicitacao ?? draftPreview?.numero ?? "",
      processo: edital?.processo ?? licitacao?.processoAdministrativo ?? "",
      modalidade: oportunidade.modalidade ?? edital?.modalidade ?? licitacao?.modalidadeNome ?? draftPreview?.modalidade ?? "",
      orgaoNome: oportunidade.orgaoNome ?? edital?.orgaoRazaoSocial ?? draftPreview?.orgaoNome ?? "",
      objetoResumo: oportunidade.objetoResumo ?? edital?.objeto ?? licitacao?.objetoResumo ?? draftPreview?.objetoResumo ?? "",
      valorEstimado: oportunidade.valorEstimado ?? edital?.valorEstimado ?? licitacao?.valorEstimadoTotal ?? "",
      dataAbertura: toDateInput(edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? draftPreview?.dataAbertura ?? null),
      dataEncerramento: toDateInput(edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null),
    }
  }, [draftPreview, edital, licitacao, oportunidade])
  const [form, setForm] = useState(initialForm)

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setForm(initialForm)
    setDialogOpen(nextOpen)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!onUpdateDetails) return

    await onUpdateDetails({
      numero: toNullable(form.numero),
      processo: toNullable(form.processo),
      modalidade: toNullable(form.modalidade),
      orgaoNome: toNullable(form.orgaoNome),
      objetoResumo: toNullable(form.objetoResumo),
      valorEstimado: toNullable(form.valorEstimado),
      dataAbertura: toNullable(form.dataAbertura),
      dataEncerramento: toNullable(form.dataEncerramento),
    })
    setDialogOpen(false)
  }

  return (
    <>
      <WorkspacePanel
        title="Dados"
        description="Ficha cadastral completa da licitação e do edital vinculados à oportunidade."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={!onUpdateDetails || isUpdating}
            onClick={() => handleDialogOpenChange(true)}
          >
            <Edit3 className="mr-2 size-4" />
            Editar dados
          </Button>
        }
      >
        <Tabs defaultValue="summary" className="gap-5">
          <TabsList
            
            className="w-fit gap-6 rounded-none border-b border-slate-200 bg-transparent p-0 text-slate-500"
          >
            <TabsTrigger value="summary" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
              Resumo
            </TabsTrigger>
            <TabsTrigger value="orgao" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
              Órgão
            </TabsTrigger>
            <TabsTrigger value="complementary" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
              Complementares
            </TabsTrigger>
            <TabsTrigger value="schedule" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
              Cronograma
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0 space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                <DataOverviewField label="Modalidade" value={edital?.modalidade ?? licitacao?.modalidadeNome ?? oportunidade.modalidade ?? draftPreview?.modalidade} bordered />
                <DataOverviewField label="Valor estimado" value={valorEstimadoDisplay} emphasized bordered />
                <DataOverviewField label="Data de abertura" value={formatDate(edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? draftPreview?.dataAbertura ?? null)} bordered />
                <DataOverviewField label="Localização" value={localizacao} />
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3">
                <DataOverviewField label="Encerramento de propostas" value={formatDate(edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null)} bordered />
                <DataOverviewField label="Publicado no PNCP" value={formatDateOnly(licitacao?.dataPublicacao ?? null)} bordered />
                <DataOverviewField label="Nº do processo" value={edital?.processo ?? licitacao?.processoAdministrativo ?? oportunidade.numero ?? draftPreview?.numero} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <DataMetricCard label="Valor total estimado" value={valorEstimadoDisplay} tone="estimate" />
              {valorHomologadoDisplay !== "Não informado" ? (
                <DataMetricCard label="Valor homologado" value={valorHomologadoDisplay} tone="success" />
              ) : null}
              <DataMetricCard label="Itens" value={String(itemCount)} tone="plain" />
            </div>

            <DataInfoSection title="Resumo & descrição completa">
              <div className="space-y-4 border-l border-slate-200 pl-3">
                <p className="text-[13px] leading-6 text-slate-700">
                  {edital?.objeto ?? licitacao?.objetoResumo ?? oportunidade.objetoResumo ?? draftPreview?.objetoResumo ?? "Não informado"}
                </p>
                {edital?.informacaoComplementar ? (
                  <p className="text-[13px] leading-6 text-slate-600">
                    {edital.informacaoComplementar}
                  </p>
                ) : null}
              </div>
            </DataInfoSection>

            <DataInfoSection title="Contexto do processo">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Título", oportunidade.title],
                    ["Número do edital", edital?.numero ?? oportunidade.numero ?? draftPreview?.numero],
                    ["Número da licitação", licitacao?.numeroLicitacao],
                    ["Situação oficial", licitacao?.situacaoOficial],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Tipo de instrumento", edital?.tipoInstrumento ?? licitacao?.tipoInstrumentoNome],
                    ["Modo de disputa", edital?.modoDisputa ?? edital?.certame?.modoDisputa],
                    ["Registro de preço", formatBoolean(edital?.srp)],
                    ["Valor homologado", valorHomologadoDisplay],
                  ]}
                />
              </div>
            </DataInfoSection>
          </TabsContent>

          <TabsContent value="orgao" className="mt-0 space-y-6">
            <DataInfoSection title="Contatos">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Órgão", edital?.orgaoRazaoSocial ?? oportunidade.orgaoNome ?? draftPreview?.orgaoNome],
                    ["Unidade compradora", edital?.unidadeNome],
                    ["Esfera", formatLabel(edital?.orgaoEsfera)],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["CNPJ", edital?.orgaoCnpj],
                    ["Município / UF", localizacao],
                    ["Poder", formatLabel(edital?.orgaoPoder)],
                  ]}
                />
              </div>
            </DataInfoSection>

            <DataInfoSection title="Unidade e organização">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Código da unidade", edital?.unidadeCodigo],
                    ["Nome da unidade", edital?.unidadeNome],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Município", edital?.municipio],
                    ["UF", edital?.uf],
                  ]}
                />
              </div>
            </DataInfoSection>
          </TabsContent>

          <TabsContent value="complementary" className="mt-0 space-y-6">
            <DataInfoSection title="Fundamento e contratação">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Amparo legal", edital?.amparoLegal],
                    ["Tipo de instrumento", edital?.tipoInstrumento ?? licitacao?.tipoInstrumentoNome],
                    ["Modo de disputa", edital?.modoDisputa ?? edital?.certame?.modoDisputa],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Registro de preço", formatBoolean(edital?.srp)],
                    ["Valor estimado", valorEstimadoDisplay],
                    ["Valor homologado", valorHomologadoDisplay],
                  ]}
                />
              </div>
            </DataInfoSection>

            <DataInfoSection title="Status e versão">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Oportunidade", formatStatusLabel(oportunidade.oportunidadeStatus)],
                    ["Licitação", formatStatusLabel(licitacao?.status)],
                    ["Edital", formatStatusLabel(edital?.status)],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Versão do edital", edital ? `${edital.versao} · ${formatLabel(edital.tipoVersao)}` : null],
                    ["Versão atual", formatBoolean(edital?.isAtual)],
                    ["Documento principal", edital?.documentoPrincipalId],
                  ]}
                />
              </div>
            </DataInfoSection>

            <DataInfoSection title="Origem e rastreabilidade">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Sistema de origem", formatLabel(licitacao?.sourceSystem)],
                    ["Referência externa", licitacao?.sourceReference],
                    ["Controle PNCP", licitacao?.numeroControlePncp],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Ano da compra", formatNumber(licitacao?.anoCompra)],
                    ["Sequencial da compra", formatNumber(licitacao?.sequencialCompra)],
                    ["Número da licitação", licitacao?.numeroLicitacao],
                  ]}
                />
              </div>
            </DataInfoSection>

            <DataInfoSection title="Links e sincronização">
              <div className="grid gap-4 md:grid-cols-2">
                <DataLinkColumn
                  rows={[
                    ["Sistema de origem", licitacao?.linkSistemaOrigem],
                    ["Processo eletrônico", licitacao?.linkProcessoEletronico],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Publicação", formatDate(licitacao?.dataPublicacao ?? null)],
                    ["Última atualização oficial", formatDate(licitacao?.ultimaAtualizacaoOficial ?? null)],
                    ["Sincronização do workspace", workspace.latestSyncAt ? formatDate(workspace.latestSyncAt) : "Sem sincronização adicional"],
                  ]}
                />
              </div>
            </DataInfoSection>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0 space-y-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid border-b border-slate-200 sm:grid-cols-2 xl:grid-cols-4">
                <DataOverviewField label="Publicação" value={formatDate(licitacao?.dataPublicacao ?? null)} bordered />
                <DataOverviewField label="Abertura" value={formatDate(edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? draftPreview?.dataAbertura ?? null)} bordered />
                <DataOverviewField label="Encerramento" value={formatDate(edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null)} bordered />
                <DataOverviewField label="Hora limite" value={edital?.cronograma?.horaLimite} />
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                <DataOverviewField label="Acolhimento início" value={formatDate(edital?.cronograma?.acolhimentoInicio ?? null)} bordered />
                <DataOverviewField label="Acolhimento fim" value={formatDate(edital?.cronograma?.acolhimentoFim ?? null)} bordered />
                <DataOverviewField label="Esclarecimentos até" value={formatDate(edital?.cronograma?.esclarecimentosAte ?? null)} bordered />
                <DataOverviewField label="Impugnação até" value={formatDate(edital?.cronograma?.impugnacaoAte ?? null)} />
              </div>
            </div>

            <DataInfoSection title="Agenda operacional">
              <div className="grid gap-4 md:grid-cols-2">
                <DataDetailColumn
                  rows={[
                    ["Acolhimento início", formatDate(edital?.cronograma?.acolhimentoInicio ?? null)],
                    ["Acolhimento fim", formatDate(edital?.cronograma?.acolhimentoFim ?? null)],
                    ["Sessão pública", formatDate(edital?.cronograma?.sessaoPublicaEm ?? null)],
                  ]}
                />
                <DataDetailColumn
                  rows={[
                    ["Hora limite", edital?.cronograma?.horaLimite],
                    ["Esclarecimentos até", formatDate(edital?.cronograma?.esclarecimentosAte ?? null)],
                    ["Impugnação até", formatDate(edital?.cronograma?.impugnacaoAte ?? null)],
                  ]}
                />
              </div>
            </DataInfoSection>
          </TabsContent>
        </Tabs>
      </WorkspacePanel>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[680px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar dados da oportunidade</DialogTitle>
              <DialogDescription>
                Atualize os campos principais usados no workspace, no board e na prévia da oportunidade.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-5 sm:grid-cols-2">
              <Field label="Número">
                <Input value={form.numero} onChange={event => setForm(current => ({ ...current, numero: event.target.value }))} />
              </Field>
              <Field label="Processo">
                <Input value={form.processo} onChange={event => setForm(current => ({ ...current, processo: event.target.value }))} />
              </Field>
              <Field label="Modalidade">
                <Input value={form.modalidade} onChange={event => setForm(current => ({ ...current, modalidade: event.target.value }))} />
              </Field>
              <Field label="Órgão">
                <Input value={form.orgaoNome} onChange={event => setForm(current => ({ ...current, orgaoNome: event.target.value }))} />
              </Field>
              <Field label="Valor estimado">
                <Input
                  inputMode="decimal"
                  value={form.valorEstimado}
                  onChange={event => setForm(current => ({ ...current, valorEstimado: event.target.value }))}
                />
              </Field>
              <Field label="Data de abertura">
                <Input
                  type="date"
                  value={form.dataAbertura}
                  onChange={event => setForm(current => ({ ...current, dataAbertura: event.target.value }))}
                />
              </Field>
              <Field label="Data de encerramento">
                <Input
                  type="date"
                  value={form.dataEncerramento}
                  onChange={event => setForm(current => ({ ...current, dataEncerramento: event.target.value }))}
                />
              </Field>
              <Field label="Objeto" className="sm:col-span-2">
                <Textarea
                  rows={4}
                  value={form.objetoResumo}
                  onChange={event => setForm(current => ({ ...current, objetoResumo: event.target.value }))}
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DataOverviewField({
  label,
  value,
  emphasized = false,
  bordered = false,
}: {
  label: string
  value: string | number | null | undefined
  emphasized?: boolean
  bordered?: boolean
}) {
  return (
    <div className={cn("px-4 py-3", bordered && "border-r border-slate-200")}>
      <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className={cn(
        "mt-1 break-words text-[13px] leading-5",
        emphasized ? "font-semibold tracking-[-0.02em] text-slate-950 sm:text-[15px]" : "font-medium text-slate-900",
      )}>
        {formatEmpty(value)}
      </p>
    </div>
  )
}

function DataMetricCard({
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
      <p className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.16em]",
        tone === "estimate" && "text-slate-700",
        tone === "success" && "text-emerald-600",
        tone === "plain" && "text-slate-500",
      )}>
        {label}
      </p>
      <p className={cn(
        "mt-2 text-[1.05rem] font-semibold tracking-[-0.02em]",
        tone === "estimate" && "text-slate-950",
        tone === "success" && "text-emerald-700",
        tone === "plain" && "text-slate-900",
      )}>
        {value}
      </p>
    </div>
  )
}

function DataInfoSection({
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
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DataDetailColumn({
  rows,
}: {
  rows: Array<[string, string | number | null | undefined]>
}) {
  return (
    <div className="space-y-3.5">
      {rows.map(([label, value]) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-words text-[13px] font-medium leading-6 text-slate-900">
            {formatEmpty(value)}
          </p>
        </div>
      ))}
    </div>
  )
}

function DataLinkColumn({
  rows,
}: {
  rows: Array<[string, string | null | undefined]>
}) {
  return (
    <div className="space-y-3.5">
      {rows.map(([label, href]) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          {href ? (
            <Button asChild variant="link" className="mt-0.5 h-auto justify-start p-0 text-[13px] font-medium">
              <a href={href} target="_blank" rel="noopener noreferrer">
                Abrir link
                <ExternalLink className="ml-2 size-3.5" />
              </a>
            </Button>
          ) : (
            <p className="mt-1 break-words text-[13px] font-medium leading-6 text-slate-900">
              Não informado
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  )
}

function toNullable(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function toDateInput(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function formatEmpty(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Não informado"
  return String(value)
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === true) return "Sim"
  if (value === false) return "Não"
  return null
}

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined ? null : String(value)
}

function formatLabel(value: string | null | undefined) {
  if (!value) return null
  return value
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatLocation(municipio: string | null | undefined, uf: string | null | undefined) {
  if (municipio && uf) return `${municipio} - ${uf}`
  return municipio || uf || "Não informado"
}

function formatDateOnly(value: string | null) {
  if (!value) return "Não informado"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value))
}
