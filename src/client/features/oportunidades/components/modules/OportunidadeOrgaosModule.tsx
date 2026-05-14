"use client"

import { Building2 } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeOrgaosModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const orgaos = workspace.licitacaoWorkspace?.edital?.orgaos ?? []
  const gerenciadores = orgaos.filter(orgao => orgao.papel === "GERENCIADOR")
  const participantes = orgaos.filter(orgao => orgao.papel !== "GERENCIADOR")

  return (
    <div className="space-y-6">
      <WorkspacePanel
        title="Órgãos da contratação"
        description="Órgão gerenciador, participantes e distribuição de itens por unidade."
        actions={
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
            {orgaos.length} órgão{orgaos.length === 1 ? "" : "s"}
          </Badge>
        }
      >
        {orgaos.length ? (
          <div className="space-y-5">
            {gerenciadores.length ? (
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gerenciador</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {gerenciadores.map(orgao => <OrgaoCard key={orgao.id} orgao={orgao} />)}
                </div>
              </section>
            ) : null}

            {participantes.length ? (
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Participantes</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {participantes.map(orgao => <OrgaoCard key={orgao.id} orgao={orgao} />)}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
            Nenhum órgão foi consolidado para esta oportunidade.
          </div>
        )}
      </WorkspacePanel>
    </div>
  )
}

type WorkspaceEdital = NonNullable<NonNullable<OportunidadeWorkspaceModel["licitacaoWorkspace"]>["edital"]>
type Orgao = WorkspaceEdital["orgaos"][number]

function OrgaoCard({ orgao }: { orgao: Orgao }) {
  const title = orgao.orgao.razaoSocial ?? orgao.orgao.nomeUnidade ?? "Órgão sem nome"

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold leading-5 text-primary">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{formatPapel(orgao.papel)}</p>
            </div>
            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-[10px] text-slate-600">
              {orgao.itens.length} item{orgao.itens.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InlineDetail label="CNPJ" value={orgao.orgao.cnpj} />
            <InlineDetail label="Unidade" value={orgao.orgao.codigoUnidade} />
            <InlineDetail label="Município" value={orgao.orgao.municipio} />
            <InlineDetail label="UF" value={orgao.orgao.uf} />
            <InlineDetail label="Esfera" value={formatLabel(orgao.orgao.esfera)} />
            <InlineDetail label="Poder" value={formatLabel(orgao.orgao.poder)} />
          </div>

          {orgao.itens.length ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Itens vinculados</p>
              <div className="mt-3 space-y-2">
                {orgao.itens.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="min-w-0 flex-1 truncate text-slate-700">
                      {item.numeroItem ? `${item.numeroItem} - ` : ""}{item.descricao ?? "Item sem descrição"}
                    </span>
                    <span className="shrink-0 font-medium text-slate-900">{formatQuantity(item.quantidadeSolicitada)}</span>
                  </div>
                ))}
                {orgao.itens.length > 5 ? (
                  <p className="text-xs text-slate-500">+ {orgao.itens.length - 5} item{orgao.itens.length - 5 === 1 ? "" : "s"}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function InlineDetail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "-"}</p>
    </div>
  )
}

function formatPapel(value: string) {
  if (value === "GERENCIADOR") return "Órgão gerenciador"
  if (value === "PARTICIPANTE") return "Órgão participante"
  return formatLabel(value)
}

function formatLabel(value: string | null | undefined) {
  if (!value) return null
  return value
    .toLowerCase()
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatQuantity(value: string | null) {
  if (!value) return "-"
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return value
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(parsed)
}
