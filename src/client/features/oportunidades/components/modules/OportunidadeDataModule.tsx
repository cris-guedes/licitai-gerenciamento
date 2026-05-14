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
import { Textarea } from "@/client/components/ui/textarea"
import { WorkspacePanel } from "@/client/components/workspace"
import type { UpdateOportunidadeDetailsPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
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
        title="Dados da Oportunidade"
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
        <div className="space-y-6">
          <DataSection title="Identificação">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="Título" value={oportunidade.title} />
              <InfoCell label="Número do edital" value={edital?.numero ?? oportunidade.numero ?? draftPreview?.numero} />
              <InfoCell label="Número da licitação" value={licitacao?.numeroLicitacao} />
              <InfoCell label="Processo" value={edital?.processo ?? licitacao?.processoAdministrativo ?? "Não informado"} />
              <InfoCell label="Modalidade" value={edital?.modalidade ?? licitacao?.modalidadeNome ?? oportunidade.modalidade ?? draftPreview?.modalidade} />
              <InfoCell label="Tipo de instrumento" value={edital?.tipoInstrumento ?? licitacao?.tipoInstrumentoNome} />
              <InfoCell label="Modo de disputa" value={edital?.modoDisputa ?? edital?.certame?.modoDisputa} />
              <InfoCell label="Situação oficial" value={licitacao?.situacaoOficial} />
              <InfoCell label="SRP" value={formatBoolean(edital?.srp)} />
            </div>
          </DataSection>

          <DataSection title="Origem e rastreabilidade">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="Sistema de origem" value={formatLabel(licitacao?.sourceSystem)} />
              <InfoCell label="Referência externa" value={licitacao?.sourceReference} />
              <InfoCell label="Controle PNCP" value={licitacao?.numeroControlePncp} />
              <InfoCell label="Ano da compra" value={formatNumber(licitacao?.anoCompra)} />
              <InfoCell label="Sequencial da compra" value={formatNumber(licitacao?.sequencialCompra)} />
              <InfoCell label="Documento principal" value={edital?.documentoPrincipalId} />
              <LinkCell label="Sistema de origem" href={licitacao?.linkSistemaOrigem} />
              <LinkCell label="Processo eletrônico" href={licitacao?.linkProcessoEletronico} />
            </div>
          </DataSection>

          <DataSection title="Órgão e unidade">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="CNPJ do órgão" value={edital?.orgaoCnpj} />
              <InfoCell label="Razão social" value={edital?.orgaoRazaoSocial ?? oportunidade.orgaoNome ?? draftPreview?.orgaoNome} />
              <InfoCell label="Esfera" value={formatLabel(edital?.orgaoEsfera)} />
              <InfoCell label="Poder" value={formatLabel(edital?.orgaoPoder)} />
              <InfoCell label="Código da unidade" value={edital?.unidadeCodigo} />
              <InfoCell label="Nome da unidade" value={edital?.unidadeNome} />
              <InfoCell label="Município" value={edital?.municipio} />
              <InfoCell label="UF" value={edital?.uf} />
            </div>
          </DataSection>

          <DataSection title="Objeto, valores e fundamento">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="Valor estimado" value={formatCurrency(edital?.valorEstimado ?? licitacao?.valorEstimadoTotal ?? oportunidade.valorEstimado) ?? "A definir"} />
              <InfoCell label="Valor homologado" value={formatCurrency(licitacao?.valorHomologadoTotal ?? null) ?? "Não informado"} />
              <InfoCell label="Amparo legal" value={edital?.amparoLegal} />
              <InfoCell label="Informação complementar" value={edital?.informacaoComplementar} />
              <InfoCell className="sm:col-span-2" label="Objeto do edital" value={edital?.objeto ?? licitacao?.objetoResumo ?? oportunidade.objetoResumo ?? draftPreview?.objetoResumo} />
            </div>
          </DataSection>

          <DataSection title="Datas, versão e status">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="Oportunidade" value={formatStatusLabel(oportunidade.oportunidadeStatus)} />
              <InfoCell label="Licitação" value={formatStatusLabel(licitacao?.status)} />
              <InfoCell label="Edital" value={formatStatusLabel(edital?.status)} />
              <InfoCell label="Versão do edital" value={edital ? `${edital.versao} · ${formatLabel(edital.tipoVersao)}` : null} />
              <InfoCell label="Versão atual" value={formatBoolean(edital?.isAtual)} />
              <InfoCell label="Publicação" value={formatDate(licitacao?.dataPublicacao ?? null)} />
              <InfoCell label="Abertura" value={formatDate(edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? draftPreview?.dataAbertura ?? null)} />
              <InfoCell label="Encerramento" value={formatDate(edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null)} />
              <InfoCell label="Última atualização oficial" value={formatDate(licitacao?.ultimaAtualizacaoOficial ?? null)} />
              <InfoCell label="Última atualização" value={formatDate(oportunidade.workflow.updatedAt ?? oportunidade.updatedAt)} />
              <InfoCell label="Sincronização do workspace" value={workspace.latestSyncAt ? formatDate(workspace.latestSyncAt) : "Sem sincronização adicional"} />
            </div>
          </DataSection>

          <DataSection title="Cronograma do edital">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCell label="Acolhimento início" value={formatDate(edital?.cronograma?.acolhimentoInicio ?? null)} />
              <InfoCell label="Acolhimento fim" value={formatDate(edital?.cronograma?.acolhimentoFim ?? null)} />
              <InfoCell label="Hora limite" value={edital?.cronograma?.horaLimite} />
              <InfoCell label="Sessão pública" value={formatDate(edital?.cronograma?.sessaoPublicaEm ?? null)} />
              <InfoCell label="Esclarecimentos até" value={formatDate(edital?.cronograma?.esclarecimentosAte ?? null)} />
              <InfoCell label="Impugnação até" value={formatDate(edital?.cronograma?.impugnacaoAte ?? null)} />
            </div>
          </DataSection>
        </div>
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

function DataSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  )
}

function InfoCell({
  label,
  value,
  className,
}: {
  label: string
  value: string | number | null | undefined
  className?: string
}) {
  return (
    <div className={`${className ?? ""} rounded-lg border border-slate-200 bg-slate-50 px-4 py-3`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-900">{formatEmpty(value)}</p>
    </div>
  )
}

function LinkCell({ label, href }: { label: string; href: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      {href ? (
        <Button asChild variant="link" className="mt-1 h-auto justify-start p-0 text-sm font-medium">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Abrir link
            <ExternalLink className="ml-2 size-3.5" />
          </a>
        </Button>
      ) : (
        <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-900">Não informado</p>
      )}
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
