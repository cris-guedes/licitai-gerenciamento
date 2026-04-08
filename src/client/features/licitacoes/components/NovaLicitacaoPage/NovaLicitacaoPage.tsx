"use client"

import { useState } from "react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card"
import { Badge } from "@/client/components/ui/badge"
import { FileText, Link, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

export function NovaLicitacaoPage() {
    const api      = useCoreApi()
    const { extractEditalData } = useLicitacaoService(api)
    const mutation = extractEditalData()

    const [pdfUrl, setPdfUrl]     = useState("")
    const [result, setResult]     = useState<ExtractEditalDataResponse | null>(null)

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
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Nova Licitação</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe a URL pública do PDF do edital para extrair o conteúdo em Markdown via Docling.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Link className="size-4" />
                        URL do Edital (PDF)
                    </CardTitle>
                    <CardDescription>
                        Cole o link direto para o arquivo PDF. O documento será baixado, convertido e
                        salvo automaticamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="pdfUrl">Link do PDF</Label>
                            <Input
                                id="pdfUrl"
                                type="url"
                                placeholder="https://pncp.gov.br/.../edital.pdf"
                                value={pdfUrl}
                                onChange={(e) => setPdfUrl(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !pdfUrl.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <FileText className="size-4 mr-2" />
                                    Extrair Edital
                                </>
                            )}
                        </Button>
                    </form>
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
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">Extração concluída</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Sessão: <code className="font-mono">{result.sessionId}</code>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <MetricBadge label="Tamanho PDF" value={formatBytes(result.metrics.pdfFileSizeBytes)} />
                                <MetricBadge label="Conversão" value={`${result.metrics.conversionTimeMs}ms`} />
                                <MetricBadge label="Tamanho MD" value={formatBytes(result.metrics.mdFileSizeBytes)} />
                                <MetricBadge label="Palavras" value={result.metrics.mdWordCount.toLocaleString("pt-BR")} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="size-4" />
                                Markdown Extraído
                            </CardTitle>
                            <CardDescription>
                                {result.metrics.mdWordCount.toLocaleString("pt-BR")} palavras •{" "}
                                {formatBytes(result.metrics.mdFileSizeBytes)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted rounded-md p-4 overflow-auto max-h-[500px] whitespace-pre-wrap break-words">
                                {result.mdContent}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

function MetricBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
            <Badge variant="secondary" className="w-fit text-xs font-mono">{value}</Badge>
        </div>
    )
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
