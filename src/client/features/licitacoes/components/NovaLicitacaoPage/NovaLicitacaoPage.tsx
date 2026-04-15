"use client"

import { useState } from "react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Card, CardContent } from "@/client/components/ui/card"
import { Badge } from "@/client/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { FileText, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Zap, Scale, Sparkles, ScanSearch, BrainCircuit } from "lucide-react"
import { MarkdownViewer } from "../MarkdownViewer/MarkdownViewer"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type { ExtractionMode } from "@/client/main/infra/apis/api-core/services/LicitacaoService"

// ─── Definição dos modos ──────────────────────────────────────────────────────

const MODES: Array<{
    id:          ExtractionMode
    label:       string
    description: string
    detail:      string
    icon:        (props: { className?: string }) => React.ReactNode
    slow?:       boolean
}> = [
    {
        id:          "velocidade",
        label:       "Velocidade",
        description: "Parser leve com análise básica de tabelas",
        detail:      "pypdfium2 · sem OCR · tabelas básicas",
        icon:        Zap,
    },
    {
        id:          "balanceado",
        label:       "Balanceado",
        description: "Análise de tabelas com parser padrão",
        detail:      "docling_parse · sem OCR · tabelas precisas",
        icon:        Scale,
    },
    {
        id:          "qualidade",
        label:       "Qualidade",
        description: "Parser de última geração para documentos complexos",
        detail:      "dlparse_v4 · sem OCR · tabelas precisas",
        icon:        Sparkles,
        slow:        true,
    },
    {
        id:          "imagem",
        label:       "Extração de Imagem",
        description: "OCR forçado para PDFs escaneados (páginas como foto)",
        detail:      "docling_parse · OCR easyocr · tabelas precisas",
        icon:        ScanSearch,
        slow:        true,
    },
    {
        id:          "agente",
        label:       "Agente IA",
        description: "Agente com busca vetorial que reconstrói contexto antes de extrair",
        detail:      "vector search · multi-query · AI SDK",
        icon:        BrainCircuit,
        slow:        true,
    },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function NovaLicitacaoPage() {
    const api      = useCoreApi()
    const { extractEditalData } = useLicitacaoService(api)
    const mutation = extractEditalData()

    const [pdfUrl, setPdfUrl] = useState("")
    const [mode,   setMode]   = useState<ExtractionMode>("balanceado")
    const [result, setResult] = useState<ExtractEditalDataResponse | null>(null)

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault()
        if (!pdfUrl.trim()) return
        setResult(null)
        const data = await mutation.mutateAsync({ pdfUrl: pdfUrl.trim(), mode })
        setResult(data)
    }

    const isLoading  = mutation.isPending
    const error      = mutation.error as Error | null
    const activeMode = MODES.find(m => m.id === mode)!

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Nova Licitação</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe a URL do PDF do edital para extrair os dados automaticamente.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-5">
                    {/* Seletor de modo */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Modo de extração
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                            {MODES.map((m) => {
                                const Icon     = m.icon
                                const selected = mode === m.id
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMode(m.id)}
                                        disabled={isLoading}
                                        className={`
                                            relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors
                                            ${selected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Icon className={`size-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                                            {m.slow && (
                                                <span className="text-[9px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-medium">
                                                    lento
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
                                                {m.label}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                                {m.description}
                                            </p>
                                        </div>
                                        <p className="text-[10px] font-mono text-muted-foreground/60 leading-tight">
                                            {m.detail}
                                        </p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* URL + botão */}
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Input
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
                        <p className="text-xs text-muted-foreground">
                            {mode === "agente"
                                ? "Baixando PDF → convertendo para Markdown → indexando chunks → agente realizando buscas vetoriais → extraindo dados..."
                                : `Baixando PDF → convertendo para Markdown via Docling (${activeMode.label}) → extraindo dados com OpenAI...`
                            }
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
                                <MetricBadge label="Itens"      value={String(result.extraction.edital.itens?.length ?? 0)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resultado */}
                    <Tabs defaultValue="edital">
                        <TabsList>
                            <TabsTrigger value="edital">Edital</TabsTrigger>
                            <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        </TabsList>

                        <TabsContent value="edital" className="mt-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <JsonViewer data={result.extraction.edital} />
                                </CardContent>
                            </Card>
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

// ─── Helpers de tipo ─────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return v !== null && typeof v === "object" && !Array.isArray(v)
}

function formatKey(key: string): string {
    return key.replace(/_/g, " ")
}

// ─── Viewer principal ─────────────────────────────────────────────────────────

function JsonViewer({ data }: { data: unknown }) {
    if (isPlainObject(data)) return <JsonSections obj={data} depth={0} />
    return <div className="text-sm"><JsonScalar value={data} /></div>
}

// Separa os campos em: escalares (grid), objetos (seções), arrays (tabelas)
function JsonSections({ obj, depth }: { obj: Record<string, unknown>; depth: number }) {
    const entries = Object.entries(obj)
    const scalars = entries.filter(([, v]) => !isPlainObject(v) && !Array.isArray(v))
    const objects = entries.filter(([, v]) => isPlainObject(v))
    const arrays  = entries.filter(([, v]) => Array.isArray(v))

    return (
        <div className="space-y-5">
            {scalars.length > 0 && (
                <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                    {scalars.map(([k, v]) => (
                        <div key={k} className="min-w-0">
                            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5 truncate">{formatKey(k)}</dt>
                            <dd className="text-sm font-medium"><JsonScalar value={v} /></dd>
                        </div>
                    ))}
                </dl>
            )}
            {objects.map(([k, v]) => (
                <div key={k}>
                    <SectionLabel title={k} depth={depth} />
                    <JsonSections obj={v as Record<string, unknown>} depth={depth + 1} />
                </div>
            ))}
            {arrays.map(([k, v]) => (
                <div key={k}>
                    <SectionLabel title={k} depth={depth} />
                    <JsonArrayTable items={v as unknown[]} />
                </div>
            ))}
        </div>
    )
}

function SectionLabel({ title, depth }: { title: string; depth: number }) {
    return (
        <p className={`uppercase tracking-wide text-muted-foreground border-b border-border/40 pb-1 mb-3 ${depth === 0 ? "text-[11px] font-semibold" : "text-[10px]"}`}>
            {formatKey(title)}
        </p>
    )
}

function JsonScalar({ value }: { value: unknown }) {
    if (value === null || value === undefined || value === "") {
        return <span className="text-muted-foreground/40 italic text-xs">—</span>
    }
    if (typeof value === "boolean") {
        return (
            <Badge variant={value ? "default" : "outline"} className="text-xs font-mono py-0 h-5">
                {value ? "Sim" : "Não"}
            </Badge>
        )
    }
    if (typeof value === "number") {
        return <span className="text-blue-600 dark:text-blue-400">{value.toLocaleString("pt-BR")}</span>
    }
    
    // Lista de objetos ou primitivos
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-muted-foreground/40 italic text-xs">—</span>
        return (
            <div className="flex flex-wrap gap-1">
                {value.map((v, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 min-h-4 h-auto font-normal">
                        {isPlainObject(v) 
                            ? Object.entries(v).map(([k, val]) => `${formatKey(k)}: ${isPlainObject(val) || Array.isArray(val) ? "..." : String(val)}`).join(", ")
                            : String(v)
                        }
                    </Badge>
                ))}
            </div>
        )
    }

    // Objeto único (Tratamento recursivo simples para evitar [object Object])
    if (isPlainObject(value)) {
        return (
            <div className="text-[10px] text-muted-foreground leading-tight space-y-0.5">
                {Object.entries(value).map(([k, v]) => (
                    <div key={k} className="flex gap-1">
                        <span className="font-semibold uppercase tracking-tighter opacity-70">{formatKey(k)}:</span>
                        <span className="text-foreground">
                            {isPlainObject(v) || Array.isArray(v) 
                                ? <JsonScalar value={v} /> // Chamada recursiva controlada
                                : String(v)
                            }
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return <span>{String(value)}</span>
}

function JsonArrayTable({ items }: { items: unknown[] }) {
    const [collapsed, setCollapsed] = useState(false)

    if (items.length === 0) {
        return <span className="text-muted-foreground/40 italic text-xs text-sm">—</span>
    }

    // Array de primitivos → badges
    if (!items.every(isPlainObject)) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono">{String(item)}</Badge>
                ))}
            </div>
        )
    }

    // Array de objetos → tabela
    const rows = items as Record<string, unknown>[]
    const keys = Array.from(new Set(rows.flatMap(r => Object.keys(r))))

    return (
        <div>
            <button
                onClick={() => setCollapsed(c => !c)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
                {collapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
                {items.length} {items.length === 1 ? "registro" : "registros"}
            </button>
            {!collapsed && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-border/60">
                                {keys.map(k => (
                                    <th key={k} className="text-left py-1.5 pr-4 font-medium text-[10px] uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                                        {formatKey(k)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
                                    {keys.map(k => (
                                        <td key={k} className="py-1.5 pr-4 align-top max-w-xs">
                                            <JsonScalar value={row[k] ?? null} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
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
