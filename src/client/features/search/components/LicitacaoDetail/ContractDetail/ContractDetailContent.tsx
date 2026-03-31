"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  AlignLeft, FileText,
  X, Download, ExternalLink, Loader2, Briefcase, Info,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/client/components/ui/tooltip"
import { formatCurrency } from "@/client/main/lib/utils/format"
import { DocumentViewer } from "@/client/components/common/DocumentViewer"
import { useContractService }   from "../../../services/contract"
import { buildContractPncpUrl, buildSancoesUrl, buildCnpjBizUrl } from "../../../utils/urls"

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "detalhes", label: "Visão Geral", icon: AlignLeft },
  { id: "arquivos", label: "Arquivos",    icon: FileText  },
] as const

type TabId = (typeof TABS)[number]["id"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtShort(str?: string | null) {
  if (!str) return null
  return new Date(str).toLocaleDateString("pt-BR")
}

function fmtFull(str?: string | null) {
  if (!str) return null
  return new Date(str).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
      <Loader2 className="size-4 animate-spin" /> {text}
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground min-h-[240px]">
      <Icon className="size-8 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

function GridCell({ label, value, tip }: { label: string; value?: string | null; tip?: string }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</span>
        {tip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-default shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">{tip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-4">
      {children}
    </h3>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <span className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{label}:</span> {value}
    </span>
  )
}

// ─── History status config ────────────────────────────────────────────────────

const HISTORY_STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  "Inclusão":    { color: "#2B86F0", bg: "#EBF3FF" },
  "Alteração":   { color: "#E8860A", bg: "#FFF4E0" },
  "Retificação": { color: "#F29E2E", bg: "#FFF4E0" },
  "Exclusão":    { color: "#E04B4B", bg: "#FFECEC" },
  "Publicação":  { color: "#6A4CFF", bg: "#F0EEFF" },
  "Arquivada":   { color: "#8A99A8", bg: "#F0F3F6" },
}
const HISTORY_STATUS_DEFAULT = { color: "#8A99A8", bg: "#F0F3F6" }

// ─── TIPO_PESSOA labels ────────────────────────────────────────────────────────

const TIPO_PESSOA_LABELS: Record<string, string> = {
  PJ: "Pessoa jurídica",
  PF: "Pessoa física",
  PE: "Pessoa estrangeira",
}

// ─── Tab: Visão Geral ─────────────────────────────────────────────────────────

function TabDetalhes({
  detail: query, terms: termsQuery, history: historyQuery,
}: Pick<ReturnType<typeof useContractService>, "detail" | "terms" | "history">) {

  const terms   = termsQuery.data?.terms ?? []
  const history = useMemo(() => {
    const entries = historyQuery.data?.entries ?? []
    return [...entries].sort(
      (a, b) => new Date(b.dataInclusao ?? 0).getTime() - new Date(a.dataInclusao ?? 0).getTime()
    )
  }, [historyQuery.data])

  const d = query.data

  if (query.isLoading) return <LoadingState text="Carregando detalhes..." />
  if (query.isError)   return <p className="text-sm text-destructive text-center py-8">Erro ao carregar detalhes.</p>
  if (!d)              return null

  const local = [d.municipioNome, d.ufSigla].filter(Boolean).join(" / ")
  const vigencia = d.dataVigenciaInicio && d.dataVigenciaFim
    ? `${fmtShort(d.dataVigenciaInicio)} a ${fmtShort(d.dataVigenciaFim)}`
    : d.dataVigenciaInicio ? `a partir de ${fmtShort(d.dataVigenciaInicio)}` : null
  const sancoesUrl  = d.niFornecedor ? buildSancoesUrl(d.niFornecedor)  : null
  const cnpjBizUrl  = d.niFornecedor ? buildCnpjBizUrl(d.niFornecedor)  : null

  return (
    <div className="flex flex-col gap-10">

      {/* ── Dados Gerais ─────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Dados Gerais</SectionTitle>
        <TooltipProvider>
          <div className="rounded-xl border border-border/40 divide-y divide-border/30 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border/30">
              <GridCell label="Tipo" value={d.tipoContratoNome}
                tip="Classificação do instrumento contratual (ex: contrato, ata de registro de preços, empenho)." />
              <GridCell label="Localização" value={local || null}
                tip="Município e estado da unidade gestora responsável pelo contrato." />
              <GridCell label="Assinatura" value={fmtShort(d.dataAssinatura)}
                tip="Data em que o contrato foi assinado pelas partes." />
              <GridCell label="Vigência" value={vigencia}
                tip="Período de validade do contrato, do início ao término da obrigação contratual." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border/30">
              <GridCell label="Órgão" value={d.orgaoNome}
                tip="Entidade pública contratante responsável pela execução do contrato." />
              <GridCell label="Unidade" value={[d.unidadeCodigo, d.unidadeNome].filter(Boolean).join(" – ") || null}
                tip="Unidade organizacional do órgão que gerencia este contrato." />
              <GridCell label="Nº do Processo" value={d.processo}
                tip="Número do processo administrativo que originou a contratação." />
            </div>
            {(d.dataPublicacaoPncp || d.categoriaNome || d.receita != null) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border/30">
                {d.dataPublicacaoPncp && (
                  <GridCell label="Publicado no PNCP" value={fmtShort(d.dataPublicacaoPncp)}
                    tip="Data em que o contrato foi divulgado no Portal Nacional de Contratações Públicas (PNCP)." />
                )}
                {d.categoriaNome && (
                  <GridCell label="Categoria" value={d.categoriaNome}
                    tip="Classificação do objeto contratado conforme tabela do PNCP (ex: Compras, Serviços, Obras)." />
                )}
                {d.receita != null && (
                  <GridCell label="Classificação" value={d.receita ? "Receita" : "Despesa"}
                    tip="Indica se o contrato representa uma entrada de recursos (Receita) ou um gasto público (Despesa)." />
                )}
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* ── Valores ──────────────────────────────────────────────────── */}
      {(d.valorInicial != null || d.valorGlobal != null || d.valorAcumulado != null || d.valorParcela != null) && (
        <TooltipProvider>
          <div className="flex flex-wrap gap-3">
            {d.valorInicial != null && (
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-5 py-4 flex flex-col gap-1 min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Valor Inicial</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-primary/40 hover:text-primary/70 transition-colors cursor-default shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      Valor original definido na assinatura do contrato, sem considerar aditivos posteriores.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-2xl font-bold text-primary">{formatCurrency(d.valorInicial)}</span>
              </div>
            )}
            {d.valorGlobal != null && (
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-5 py-4 flex flex-col gap-1 min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Valor Global</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-primary/40 hover:text-primary/70 transition-colors cursor-default shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      Valor total do contrato considerando todos os termos aditivos de acréscimo ou supressão.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-2xl font-bold text-primary">{formatCurrency(d.valorGlobal)}</span>
              </div>
            )}
            {d.valorAcumulado != null && (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-5 py-4 flex flex-col gap-1 min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/60">Valor Acumulado</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-emerald-600/40 hover:text-emerald-600/70 dark:text-emerald-400/40 dark:hover:text-emerald-400/70 transition-colors cursor-default shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      Soma dos valores efetivamente pagos ou empenhados ao longo da execução do contrato.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.valorAcumulado)}</span>
              </div>
            )}
            {d.valorParcela != null && (
              <div className="rounded-xl bg-muted/40 border border-border/40 px-5 py-4 flex flex-col gap-1 min-w-[180px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Valor da Parcela{d.numeroParcelas ? ` (${d.numeroParcelas}x)` : ""}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors cursor-default shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      Valor de cada parcela de pagamento prevista no contrato{d.numeroParcelas ? `, dividido em ${d.numeroParcelas} parcelas` : ""}.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-xl font-bold text-foreground/80">{formatCurrency(d.valorParcela)}</span>
              </div>
            )}
          </div>
        </TooltipProvider>
      )}

      {/* ── Objeto ───────────────────────────────────────────────────── */}
      {d.objetoContrato && (
        <div>
          <SectionTitle>Objeto do Contrato</SectionTitle>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {d.objetoContrato}
          </p>
        </div>
      )}

      {/* ── Fornecedor ───────────────────────────────────────────────── */}
      {(d.nomeRazaoSocialFornecedor || d.niFornecedor) && (
        <div>
          <SectionTitle>Fornecedor</SectionTitle>
          <div className="rounded-xl border border-border/40 divide-y divide-border/30 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border/30">
              {d.nomeRazaoSocialFornecedor && (
                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Nome / Razão Social</span>
                  {cnpjBizUrl ? (
                    <a href={cnpjBizUrl} target="_blank" rel="noopener noreferrer"
                       className="text-sm font-semibold hover:underline underline-offset-2 transition-colors w-fit">
                      {d.nomeRazaoSocialFornecedor}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold">{d.nomeRazaoSocialFornecedor}</span>
                  )}
                </div>
              )}
              {d.niFornecedor && (
                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">CNPJ / CPF</span>
                  <span className="text-sm font-mono font-medium">{d.niFornecedor}</span>
                </div>
              )}
              {d.tipoPessoa && (
                <div className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tipo</span>
                  <span className="text-sm font-medium">{TIPO_PESSOA_LABELS[d.tipoPessoa] ?? d.tipoPessoa}</span>
                </div>
              )}
            </div>
            {(cnpjBizUrl || sancoesUrl) && (
              <div className="px-4 py-2.5 flex flex-wrap gap-x-5 gap-y-1">
                {cnpjBizUrl && (
                  <a href={cnpjBizUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 w-fit transition-colors">
                    Consultar CNPJ <ExternalLink size={10} className="shrink-0" />
                  </a>
                )}
                {sancoesUrl && (
                  <a href={sancoesUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 w-fit transition-colors">
                    Consultar sanções e penalidades do fornecedor <ExternalLink size={10} className="shrink-0" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Info complementar ────────────────────────────────────────── */}
      {d.informacaoComplementar && (
        <div>
          <SectionTitle>Informação Complementar</SectionTitle>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
            {d.informacaoComplementar}
          </p>
        </div>
      )}

      {/* ── Termos Aditivos (inline, only when present) ──────────────── */}
      {terms.length > 0 && (
        <div className="border-t border-border/30 pt-10">
          <SectionTitle>Termos Aditivos ({terms.length})</SectionTitle>
          <div className="flex flex-col gap-3">
            {terms.map((t, i) => {
              const vigTermo = t.dataVigenciaInicio && t.dataVigenciaFim
                ? `${fmtShort(t.dataVigenciaInicio)} a ${fmtShort(t.dataVigenciaFim)}`
                : t.dataVigenciaInicio ? `a partir de ${fmtShort(t.dataVigenciaInicio)}` : null
              return (
                <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
                  <div className="flex items-start justify-between gap-2 px-4 py-3 bg-muted/20 border-b border-border/30">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">
                        {t.numeroTermoContrato ? `Termo nº ${t.numeroTermoContrato}` : `Termo ${i + 1}`}
                      </span>
                      {t.tipoTermoContratoNome && (
                        <span className="text-xs text-muted-foreground">{t.tipoTermoContratoNome}</span>
                      )}
                    </div>
                    {t.valorGlobal != null && (
                      <span className="text-sm font-bold text-primary shrink-0">{formatCurrency(t.valorGlobal)}</span>
                    )}
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-3">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-8 gap-y-2">
                      {t.dataAssinatura     && <DetailField label="Assinatura"      value={fmtShort(t.dataAssinatura)} />}
                      {t.dataPublicacaoPncp && <DetailField label="Publicação PNCP" value={fmtShort(t.dataPublicacaoPncp)} />}
                      {vigTermo             && <DetailField label="Vigência"        value={vigTermo} />}
                      {t.prazoAditadoDias != null && <DetailField label="Prazo aditado"   value={`${t.prazoAditadoDias} dias`} />}
                      {t.valorAcrescido   != null && <DetailField label="Valor acrescido" value={formatCurrency(t.valorAcrescido)} />}
                      {t.valorParcela     != null && <DetailField label="Valor da parcela" value={formatCurrency(t.valorParcela)} />}
                      {t.numeroParcelas   != null && <DetailField label="Parcelas"         value={String(t.numeroParcelas)} />}
                    </div>
                    {t.objetoTermoContrato && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.objetoTermoContrato}</p>
                    )}
                    {t.fundamentoLegal && (
                      <DetailField label="Fundamento legal" value={t.fundamentoLegal} />
                    )}
                    {t.informacaoComplementar && (
                      <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
                        {t.informacaoComplementar}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Histórico de Alterações (horizontal timeline) ───────────── */}
      {history.length > 0 && (
        <div className="border-t border-border/30 pt-10">
          <SectionTitle>Histórico de Alterações ({history.length})</SectionTitle>
          <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            <div className="flex min-w-max items-start">
              {history.map((e, i) => {
                const isFirst  = i === 0
                const isLast   = i === history.length - 1
                const isLatest = i === 0
                const cfg = HISTORY_STATUS_CONFIG[e.tipoLogManutencaoNome ?? ""] ?? HISTORY_STATUS_DEFAULT
                const d   = e.dataInclusao ? new Date(e.dataInclusao) : null
                const monthYear = d
                  ? d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "")
                  : "—"
                const fullDate = d
                  ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : null
                const time = d
                  ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : null

                return (
                  <div key={i} className="flex flex-col items-center" style={{ minWidth: 156 }}>

                    {/* ── top: month/year ── */}
                    <span className="text-[10px] font-semibold text-muted-foreground/60 mb-2 capitalize tracking-wide">
                      {monthYear}
                    </span>

                    {/* ── middle: line + dot ── */}
                    <div className="flex items-center w-full">
                      <div className="flex-1 h-px" style={{ background: isFirst ? "transparent" : "#E6EDF4" }} />
                      <div
                        style={{
                          background: cfg.color,
                          ...(isLatest ? { outline: `2px solid ${cfg.color}`, outlineOffset: 2 } : {}),
                        }}
                        className={`rounded-full shrink-0 z-10 ${isLatest ? "size-3" : "size-2.5"}`}
                      />
                      <div className="flex-1 h-px" style={{ background: isLast ? "transparent" : "#E6EDF4" }} />
                    </div>

                    {/* ── bottom: event info centered ── */}
                    <div className="mt-3 px-2 flex flex-col items-center text-center gap-0.5 w-full">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold leading-snug" style={{ color: cfg.color }}>
                          {e.tipoLogManutencaoNome ?? "Alteração"}
                        </span>
                        {isLatest && (
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                            style={{ color: cfg.color, borderColor: cfg.color, background: cfg.bg }}
                          >
                            Última atualização
                          </span>
                        )}
                      </div>
                      {e.categoriaLogManutencaoNome && (
                        <span className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                          {e.categoriaLogManutencaoNome}
                        </span>
                      )}
                      {fullDate && (
                        <span className="text-[10px] text-muted-foreground/60 leading-snug mt-1">
                          {fullDate}{time ? ` · ${time}` : ""}
                        </span>
                      )}
                      {e.justificativa && (
                        <p className="text-[10px] text-muted-foreground/60 leading-snug line-clamp-2 mt-1 italic border-t border-border/30 pt-1 w-full">
                          {e.justificativa}
                        </p>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Tab: Arquivos ────────────────────────────────────────────────────────────

function TabArquivos({
  files: query,
}: Pick<ReturnType<typeof useContractService>, "files">) {
  const [selected, setSelected] = useState<{ url: string; title: string } | null>(null)

  const files = query.data?.files ?? []
  const firstUrl = files[0]?.url
  useEffect(() => {
    if (!selected && firstUrl) setSelected({ url: firstUrl, title: files[0]?.titulo ?? "Documento" })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstUrl])

  return (
    <div className="flex flex-1 min-h-0 h-full">

      {/* Document list */}
      <div className="w-64 shrink-0 border-r border-border/40 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="px-4 py-3 border-b border-border/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Documentos{files.length > 0 ? ` (${files.length})` : ""}
          </span>
        </div>
        {query.isLoading && <LoadingState text="Carregando..." />}
        {query.isError   && <p className="text-xs text-destructive text-center py-4">Erro ao carregar.</p>}
        {!query.isLoading && files.length === 0 && <EmptyState icon={FileText} text="Nenhum documento." />}
        <div className="flex flex-col gap-0.5 p-2">
          {files.map((f, i) => (
            <div key={i} className={`flex items-start gap-1 rounded-md transition-colors ${
              selected?.url === f.url ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}>
              <button type="button" onClick={() => setSelected({ url: f.url!, title: f.titulo ?? "Documento" })}
                      className="flex-1 min-w-0 text-left px-3 py-2.5">
                <span className="text-xs font-medium leading-snug line-clamp-2 block">{f.titulo ?? "Documento"}</span>
                {f.tipoDocumentoNome && <span className="text-[10px] opacity-60">{f.tipoDocumentoNome}</span>}
              </button>
              {f.url && (
                <a href={f.url} download onClick={e => e.stopPropagation()}
                   className="shrink-0 flex items-center justify-center size-8 mt-1 mr-1 rounded-md hover:bg-muted/60 transition-colors opacity-50 hover:opacity-100" title="Download">
                  <Download className="size-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selected
          ? <DocumentViewer url={selected.url} title={selected.title} className="h-full" />
          : <EmptyState icon={FileText} text="Selecione um documento para visualizar." />
        }
      </div>

    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ContractDetailContentProps {
  orgaoCnpj:            string
  anoContrato:          number
  sequencialContrato:   number
  numeroContratoEmpenho?: string
  onClose:              () => void
}

export function ContractDetailContent({
  orgaoCnpj, anoContrato, sequencialContrato, numeroContratoEmpenho, onClose,
}: ContractDetailContentProps) {
  const { detail, files, history, terms } = useContractService({ cnpj: orgaoCnpj, anoContrato, sequencialContrato })

  const [activeTab, setActiveTab] = useState<TabId>("detalhes")
  const [visited, setVisited] = useState<Set<TabId>>(new Set(["detalhes"]))

  const handleTab = (id: TabId) => {
    setActiveTab(id)
    setVisited(prev => new Set([...prev, id]))
  }

  const pncpUrl = buildContractPncpUrl(orgaoCnpj, anoContrato, sequencialContrato)

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 shrink-0">
        <Briefcase className="size-4 text-muted-foreground shrink-0" />
        <span className="text-base font-bold text-foreground flex-1">
          {numeroContratoEmpenho ? `Contrato nº ${numeroContratoEmpenho}` : `Contrato ${anoContrato}/${sequencialContrato}`}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          {pncpUrl && (
            <a href={pncpUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ver no PNCP <ExternalLink className="size-3" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + content ───────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Left nav */}
        <aside className="w-40 shrink-0 border-r border-border/40 flex flex-col py-4 gap-0.5 overflow-y-auto"
               style={{ scrollbarWidth: "none" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors rounded-none border-l-2 ${
                activeTab === id
                  ? "border-primary text-foreground bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Tab content */}
        <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "arquivos" ? "overflow-hidden" : "overflow-y-auto"}`} style={{ scrollbarWidth: "thin" }}>
          {activeTab === "detalhes" && (
            <div className="px-6 py-5">
              {visited.has("detalhes") && (
                <TabDetalhes detail={detail} terms={terms} history={history} />
              )}
            </div>
          )}
          {activeTab === "arquivos" && (
            <div className="flex flex-1 min-h-0 h-full">
              {visited.has("arquivos") && (
                <TabArquivos files={files} />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
