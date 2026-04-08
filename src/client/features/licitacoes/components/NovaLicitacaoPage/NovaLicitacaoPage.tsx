"use client"

import { useState } from "react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card"
import { Badge } from "@/client/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { FileText, Link, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { MarkdownViewer } from "../MarkdownViewer/MarkdownViewer"
import type { AnaliseCriticaEdital, ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

export function NovaLicitacaoPage() {
    const api      = useCoreApi()
    const { extractEditalData } = useLicitacaoService(api)
    const mutation = extractEditalData()

    const [pdfUrl, setPdfUrl] = useState("")
    const [result, setResult] = useState<ExtractEditalDataResponse | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!pdfUrl.trim()) return
        setResult(null)
        const data = await mutation.mutateAsync(pdfUrl.trim())
        setResult(data)
    }

    const isLoading = mutation.isPending
    const error     = mutation.error as Error | null

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Nova Licitação</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe a URL do PDF do edital para extrair a Análise Crítica automaticamente.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Link className="size-4" />
                        URL do Edital (PDF)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
                            id="pdfUrl"
                            type="url"
                            placeholder="https://pncp.gov.br/.../edital.pdf"
                            value={pdfUrl}
                            onChange={(e) => setPdfUrl(e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !pdfUrl.trim()}>
                            {isLoading ? (
                                <><Loader2 className="size-4 mr-2 animate-spin" />Processando...</>
                            ) : (
                                <><FileText className="size-4 mr-2" />Extrair Edital</>
                            )}
                        </Button>
                    </form>
                    {isLoading && (
                        <p className="text-xs text-muted-foreground mt-3">
                            Baixando PDF → convertendo para Markdown (Docling) → extraindo dados (OpenAI)...
                        </p>
                    )}
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4 flex items-start gap-3">
                        <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-destructive">Erro na extração</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="space-y-4">
                    {/* Métricas */}
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Extração concluída</p>
                                    <p className="text-xs text-muted-foreground">
                                        Sessão: <code className="font-mono">{result.sessionId}</code>
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
                                <MetricBadge label="PDF"        value={formatBytes(result.metrics.pdfFileSizeBytes)} />
                                <MetricBadge label="Páginas"    value={`~${estimatePages(result.metrics.mdWordCount)}`} />
                                <MetricBadge label="Conversão"  value={formatSeconds(result.metrics.conversionTimeMs)} />
                                <MetricBadge label="OpenAI"     value={formatSeconds(result.metrics.extractionTimeMs)} />
                                <MetricBadge label="Total"      value={formatSeconds(result.metrics.totalTimeMs)} />
                                <MetricBadge label="Tokens"     value={result.metrics.tokensUsed.total.toLocaleString("pt-BR")} />
                                <MetricBadge label="Itens"      value={String(result.analiseCritica.itens?.length ?? 0)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resultado */}
                    <Tabs defaultValue="analise">
                        <TabsList>
                            <TabsTrigger value="analise">Análise Crítica</TabsTrigger>
                            <TabsTrigger value="itens">Itens ({result.analiseCritica.itens?.length ?? 0})</TabsTrigger>
                            <TabsTrigger value="documentos">Documentações</TabsTrigger>
                            <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        </TabsList>

                        <TabsContent value="analise" className="mt-4">
                            <AnaliseCriticaCard analise={result.analiseCritica} />
                        </TabsContent>

                        <TabsContent value="itens" className="mt-4">
                            <ItensTable itens={result.analiseCritica.itens ?? []} />
                        </TabsContent>

                        <TabsContent value="documentos" className="mt-4">
                            <DocumentacoesCard docs={result.analiseCritica.documentacoes} outros={result.analiseCritica.documentacoes.outrosDocumentos} />
                        </TabsContent>

                        <TabsContent value="markdown" className="mt-6">
                            <Card className="overflow-hidden border-none shadow-none bg-transparent">
                                <MarkdownViewer
                                    content={result.mdContent}
                                    wordCount={result.metrics.mdWordCount}
                                    fileSizeKb={result.metrics.mdFileSizeBytes / 1024}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function AnaliseCriticaCard({ analise }: { analise: AnaliseCriticaEdital }) {
    const campos: Array<[string, string]> = [
        ["Órgão",                    analise.orgao],
        ["UASG",                     analise.uasg],
        ["Nº Edital",                analise.numeroEdital],
        ["Nº Processo",              analise.numeroProcesso],
        ["Data de Abertura",         analise.dataAbertura],
        ["Abertura",                 analise.abertura],
        ["Modalidade",               analise.modalidade],
        ["Modo de Disputa",          analise.modoDisputa],
        ["Tipo de Lance",            analise.tipoDeLance],
        ["Critério de Julgamento",   analise.criterioJulgamento],
        ["Intervalo de Lances",      analise.intervaloLances],
        ["Plataforma",               analise.plataforma],
        ["UF",                       analise.uf],
        ["Cidade",                   analise.cidade],
        ["Âmbito",                   analise.ambito],
        ["Regionalidade",            analise.regionalidade],
        ["EPP/ME",                   analise.eppMe],
        ["Adesão",                   analise.adesao],
        ["DIFAL",                    analise.difal],
        ["Cadastro",                 analise.cadastro],
        ["Esclarecimento/Impugn.",   analise.esclarecimentoImpugnacao],
        ["Prazo Envio Proposta",     analise.prazoEnvioProposta],
        ["Prazo de Entrega",         analise.prazoEntrega],
        ["Tipo de Entrega",          analise.tipoEntrega],
        ["Tipo de Garantia",         analise.tipoGarantia],
        ["Instalação",               analise.instalacao],
        ["Validade da Proposta",     analise.validadeProposta],
        ["Garantia",                 analise.garantia],
        ["Prazo de Aceite",          analise.prazoAceite],
        ["Prazo para Pagamento",     analise.prazoPagamento],
    ]

    return (
        <Card>
            <CardContent className="pt-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {campos.map(([label, value]) => value ? (
                        <div key={label} className="flex flex-col gap-0.5 py-1 border-b border-border/50 last:border-0">
                            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
                            <dd className="text-sm font-medium">{value}</dd>
                        </div>
                    ) : null)}
                </dl>
                {analise.obs && (
                    <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">OBS</p>
                        <p className="text-sm">{analise.obs}</p>
                    </div>
                )}
                {analise.observacoes && (
                    <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm">{analise.observacoes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ItensTable({ itens }: { itens: AnaliseCriticaEdital["itens"] }) {
    if (!itens?.length) return (
        <Card><CardContent className="pt-6 text-center text-muted-foreground text-sm">Nenhum item extraído.</CardContent></Card>
    )
    return (
        <Card>
            <CardContent className="pt-4 overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b">
                            {["Nº", "Produto", "Qtd", "NCM", "Marca", "Modelo", "R$ Ref.", "R$ Ref. Total"].map(h => (
                                <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {itens.map((item) => (
                            <tr key={item.numero} className="border-b last:border-0 hover:bg-muted/40">
                                <td className="py-2 pr-4 font-mono">{item.numero}</td>
                                <td className="py-2 pr-4 max-w-[240px] truncate" title={item.produto}>{item.produto || "—"}</td>
                                <td className="py-2 pr-4 text-right font-mono">{item.quantidade}</td>
                                <td className="py-2 pr-4 font-mono">{item.ncm || "—"}</td>
                                <td className="py-2 pr-4">{item.marca || "—"}</td>
                                <td className="py-2 pr-4">{item.modelo || "—"}</td>
                                <td className="py-2 pr-4 text-right font-mono">{item.valorReferencia ? formatCurrency(item.valorReferencia) : "—"}</td>
                                <td className="py-2 pr-4 text-right font-mono">{item.valorReferenciaTotal ? formatCurrency(item.valorReferenciaTotal) : "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}

function DocumentacoesCard({ docs, outros }: { docs: AnaliseCriticaEdital["documentacoes"]; outros: string }) {
    const labels: Record<string, string> = {
        cnpj:                        "CNPJ",
        inscricaoEstadual:           "Inscrição Estadual",
        certidaoFgts:                "Certidão FGTS",
        certidaoTributosFederais:    "Certidão Tributos Federais",
        certidaoTributosEstaduais:   "Certidão Tributos Estaduais",
        certidaoTributosMunicipais:  "Certidão Tributos Municipais",
        certidaoTrabalhista:         "Certidão Trabalhista",
        certidaoFalenciaRecuperacao: "Certidão Falência/Recuperação",
        contratoSocial:              "Contrato Social",
        docSocios:                   "Doc. Sócios",
        balancos:                    "Balanços",
        atestado:                    "Atestado",
        alvara:                      "Alvará",
        certidaoJunta:               "Certidão da Junta",
        certidaoUnificadaCgu:        "Certidão Unificada CGU",
        inscricaoMunicipal:          "Inscrição Municipal",
        garantiaProposta:            "Garantia de Proposta",
    }

    return (
        <Card>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(labels).map(([key, label]) => {
                        const required = (docs as any)[key] as boolean
                        return (
                            <div key={key} className="flex items-center gap-2 py-1">
                                <span className={`size-2 rounded-full shrink-0 ${required ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                                <span className={`text-xs ${required ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
                            </div>
                        )
                    })}
                </div>
                {outros && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Outros documentos</p>
                        <p className="text-sm">{outros}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MetricBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
            <Badge variant="secondary" className="w-fit text-xs font-mono">{value}</Badge>
        </div>
    )
}

function formatSeconds(ms: number): string {
    return `${(ms / 1000).toFixed(1)}s`
}

function estimatePages(wordCount: number): number {
    return Math.max(1, Math.round(wordCount / 250))
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
