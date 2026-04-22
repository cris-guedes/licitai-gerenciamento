"use client"

import { useState } from "react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { Badge } from "@/client/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import {
    FileText, Loader2, CheckCircle2, AlertCircle,
    Building2, CalendarClock, Gavel, Truck, Info, Users2, ClipboardCheck,
    ListOrdered, Upload, X
} from "lucide-react"
import { MarkdownViewer } from "../MarkdownViewer/MarkdownViewer"
import { Separator } from "@/client/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

// ─── Page ─────────────────────────────────────────────────────────────────────

export function NovaLicitacaoPage() {
    const api    = useCoreApi()
    const { extractEdital } = useLicitacaoService(api)
    const extract = extractEdital()

    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [result,  setResult]  = useState<ExtractEditalDataResponse | null>(null)

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault()
        if (!pdfFile) return
        setResult(null)
        extract.reset()
        try {
            const data = await extract.mutateAsync({ file: pdfFile })
            setResult(data)
        } catch { /* error em extract.error */ }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPdfFile(e.target.files?.[0] ?? null)
    }

    function clearFile() {
        setPdfFile(null)
        const input = document.getElementById("edital-file-input") as HTMLInputElement | null
        if (input) input.value = ""
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Nova Licitação</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Faça o upload do PDF do edital para extrair os dados automaticamente.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1">
                            {pdfFile ? (
                                <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/30 text-sm">
                                    <FileText className="size-4 text-primary shrink-0" />
                                    <span className="flex-1 truncate font-medium">{pdfFile.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {formatBytes(pdfFile.size)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        disabled={extract.isPending}
                                        className="text-muted-foreground hover:text-foreground shrink-0 disabled:opacity-50"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="edital-file-input"
                                    className="flex items-center gap-2 h-9 px-3 rounded-md border border-dashed cursor-pointer hover:bg-muted/30 transition-colors text-sm text-muted-foreground"
                                >
                                    <Upload className="size-4 shrink-0" />
                                    <span>Clique para selecionar o PDF do edital</span>
                                </label>
                            )}
                            <input
                                id="edital-file-input"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                disabled={extract.isPending}
                                className="sr-only"
                            />
                        </div>
                        <Button type="submit" disabled={extract.isPending || !pdfFile}>
                            {extract.isPending ? (
                                <><Loader2 className="size-4 mr-2 animate-spin" />Processando...</>
                            ) : (
                                <><FileText className="size-4 mr-2" />Extrair Edital</>
                            )}
                        </Button>
                    </form>

                    {extract.isPending && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                            <Loader2 className="size-3.5 animate-spin shrink-0" />
                            <span>Extraindo dados do edital — isso pode levar alguns minutos...</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {extract.error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4 flex items-start gap-3">
                        <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-destructive">Erro na extração</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{extract.error.message}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="space-y-4">
                    <ExtractionMetrics result={result} />

                    <Tabs defaultValue="licitacao">
                        <TabsList>
                            <TabsTrigger value="licitacao">Licitação</TabsTrigger>
                            <TabsTrigger value="json">Dados (JSON)</TabsTrigger>
                            <TabsTrigger value="json-readable">JSON (Legível)</TabsTrigger>
                            <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        </TabsList>

                        <TabsContent value="licitacao" className="mt-4">
                            <LicitacaoDetailView data={result.licitacao} />
                        </TabsContent>

                        <TabsContent value="json" className="mt-4">
                            <Card className="bg-slate-950 border-slate-800">
                                <CardContent className="p-0">
                                    <pre className="p-6 text-emerald-400 font-mono text-xs overflow-auto max-h-[600px] leading-relaxed">
                                        {JSON.stringify(result.licitacao, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="json-readable" className="mt-4">
                            <Card className="border-border/50 bg-muted/5">
                                <CardContent className="p-6">
                                    <div className="font-mono text-sm space-y-2">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">Estrutura de Dados Extraída</p>
                                        <JsonView data={result.licitacao} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="markdown" className="mt-6">
                            <Card className="overflow-hidden border-none shadow-none bg-transparent">
                                <MarkdownViewer
                                    content={result.mdContent}
                                    wordCount={result.metrics.totalWords}
                                    fileSizeKb={result.metrics.totalChars / 1024}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}


// ─── Métricas ─────────────────────────────────────────────────────────────────

function ExtractionMetrics({ result }: { result: ExtractEditalDataResponse }) {
    const { metrics, licitacao } = result
    const totalItens = licitacao.edital?.itens?.length ?? 0

    return (
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <MetricBadge label="PDF"         value={formatBytes(metrics.pdfFileSizeBytes)} />
                    <MetricBadge label="Palavras"     value={metrics.totalWords.toLocaleString("pt-BR")} />
                    <MetricBadge label="Chunks"       value={String(metrics.entriesIndexed)} />
                    <MetricBadge label="Tokens"       value={metrics.tokensUsed.total.toLocaleString("pt-BR")} />
                    <MetricBadge label="Busca"        value={formatSeconds(metrics.prepareQueriesTimeMs)} />
                    
                    <MetricBadge label="Conversão"    value={formatSeconds(metrics.conversionTimeMs)} />
                    <MetricBadge label="Embedding"    value={formatSeconds(metrics.embeddingTimeMs)} />
                    <MetricBadge label="Indexação"    value={formatSeconds(metrics.indexingTimeMs)} />
                    <MetricBadge label="Extração IA"  value={formatSeconds(metrics.extractionTimeMs)} />
                    <MetricBadge label="Total"        value={formatSeconds(metrics.totalTimeMs)} />
                </div>
                {totalItens > 0 && (
                    <p className="text-xs text-muted-foreground mt-3">
                        {totalItens} {totalItens === 1 ? "item extraído" : "itens extraídos"}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

// ─── Licitacao Detail View ───────────────────────────────────────────────────

function LicitacaoDetailView({ data }: { data: ExtractEditalDataResponse["licitacao"] }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* 1. Header / Capa */}
            <Card className="overflow-hidden border-l-4 border-l-primary">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1 flex-1">
                             <div className="flex items-center gap-8 mb-4">
                                <InfoField 
                                    label="Modalidade" 
                                    value={
                                        <Badge variant="outline" className="font-mono text-[10px] uppercase h-5">
                                            {data.modalidade?.replace("_", " ") ?? "N/A"}
                                        </Badge>
                                    } 
                                />
                                <InfoField 
                                    label="Registro de Preços" 
                                    value={
                                        <Badge 
                                            className={`${data.srp ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-800 border-slate-200"} hover:opacity-100 h-5 text-[10px] uppercase font-bold`}
                                        >
                                            {data.srp ? "Sim (SRP)" : "Não"}
                                        </Badge>
                                    } 
                                />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-4">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono mb-0.5">Número / Ano</p>
                                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                                            {data.numeroLicitacao} / {data.ano}
                                        </h2>
                                    </div>
                                    <div className="flex gap-8">
                                        <InfoField label="Processo" value={data.processo} />
                                        <InfoField label="Situação" value={data.situacao} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono mb-0.5">Objeto</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {data.objeto}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div className="flex flex-row md:flex-col gap-4 md:items-end justify-between md:justify-start">
                             <div className="text-right">
                                 <p className="text-[10px] uppercase font-semibold text-muted-foreground">Valor Estimado</p>
                                 <p className="text-lg font-bold text-primary">
                                     {data.valorTotalEstimado ? `R$ ${data.valorTotalEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                                 </p>
                             </div>
                             <div className="text-right">
                                 <p className="text-[10px] uppercase font-semibold text-muted-foreground">Valor Homologado</p>
                                 <p className="text-lg font-bold text-emerald-600">
                                     {data.valorTotalHomologado ? `R$ ${data.valorTotalHomologado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                                 </p>
                             </div>
                             {data.dataPublicacao && (
                                 <div className="text-right">
                                     <p className="text-[10px] uppercase font-semibold text-muted-foreground">Publicação</p>
                                     <p className="text-sm font-medium">{formatDate(data.dataPublicacao)}</p>
                                 </div>
                             )}
                         </div>
                                    <InfoField label="Amparo Legal" value={data.edital?.amparoLegal} fullWidth />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoField label="ID Externo" value={data.identificadorExterno} />
                                        <InfoField label="Link Processo" value={data.linkProcesso} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Órgão Gerenciador */}
                 <SectionCard title="Órgão Gerenciador" icon={Building2} evidence={data.orgaoGerenciador?.textoOriginal}>
                     <div className="grid grid-cols-2 gap-4">
                         <InfoField label="Nome do Órgão" value={data.orgaoGerenciador?.nome} fullWidth />
                         <InfoField label="CNPJ" value={data.orgaoGerenciador?.cnpj} />
                         <InfoField label="Esfera" value={data.orgaoGerenciador?.esfera} isEnum />
                         <InfoField label="Unidade (UASG/Cód)" value={data.orgaoGerenciador?.codigoUnidade ? `${data.orgaoGerenciador.codigoUnidade} - ${data.orgaoGerenciador.nomeUnidade}` : null} fullWidth />
                         <InfoField label="Cidade/UF" value={data.orgaoGerenciador?.municipio ? `${data.orgaoGerenciador.municipio} / ${data.orgaoGerenciador.uf}` : null} />
                         <InfoField label="Poder" value={data.orgaoGerenciador?.poder} isEnum />
                     </div>
                 </SectionCard>

                {/* 3. Cronograma */}
                <SectionCard title="Cronograma" icon={CalendarClock} evidence={data.edital?.cronograma.textoOriginal}>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Abertura Propostas" value={data.edital?.cronograma.acolhimentoInicio} isDate />
                        <InfoField label="Limite Propostas" value={data.edital?.cronograma.acolhimentoFim} isDate />
                        <InfoField label="Hora Limite" value={data.edital?.cronograma.horaLimite} />
                        <InfoField label="Sessão Pública" value={data.edital?.cronograma.sessaoPublica} isDate />
                        <InfoField label="Hora Sessão" value={data.edital?.cronograma.horaSessaoPublica} />
                        <InfoField
                            label="Esclarecimentos Até"
                            value={data.edital?.cronograma.esclarecimentosAte}
                            isDate
                            subValue={data.edital?.cronograma.textoOriginalPrazos}
                        />
                        <InfoField
                            label="Impugnação Até"
                            value={data.edital?.cronograma.impugnacaoAte}
                            isDate
                            subValue={!data.edital?.cronograma.esclarecimentosAte ? data.edital?.cronograma.textoOriginalPrazos : null}
                        />
                    </div>
                </SectionCard>

                {/* 4. Regras do Certame */}
                <SectionCard title="Certame" icon={Gavel} evidence={data.edital?.certame.textoOriginal}>
                    <div className="space-y-4">
                        <SubGroup label="Disputa" evidence={data.edital?.certame.textoOriginalDisputa}>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Modo de Disputa" value={data.edital?.certame.modoDisputa} isEnum />
                                <InfoField label="Critério Julgamento" value={data.edital?.certame.criterioJulgamento} isEnum />
                                <InfoField label="Tipo Lance" value={data.edital?.certame.tipoLance} isEnum />
                                <InfoField label="Intervalo Lances" value={data.edital?.certame.intervaloLances} />
                                <InfoField label="Duração Sessão" value={data.edital?.certame.duracaoSessaoMinutos ? `${data.edital.certame.duracaoSessaoMinutos} min` : null} />
                            </div>
                        </SubGroup>
                        <SubGroup label="Participação">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Exclusivo ME/EPP" value={data.edital?.certame.exclusivoMeEpp} isBoolean subValue={data.edital?.certame.exclusivoMeEppTexto} />
                                <InfoField label="Permite Consórcio" value={data.edital?.certame.permiteConsorcio} isBoolean subValue={data.edital?.certame.permiteConsorcioTexto} />
                                <InfoField label="Visita Técnica" value={data.edital?.certame.exigeVisitaTecnica} isBoolean subValue={data.edital?.certame.exigeVisitaTecnicaTexto} />
                                <InfoField label="DIFAL" value={data.edital?.certame.difal} isBoolean />
                                <InfoField label="Regionalidade" value={data.edital?.certame.regionalidade} fullWidth />
                            </div>
                        </SubGroup>
                        <SubGroup label="Adesão e Vigências">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Permite Adesão (Carona)" value={data.edital?.certame.permiteAdesao} isBoolean subValue={data.edital?.certame.permiteAdesaoTexto} />
                                <InfoField label="Máx. Adesão (%)" value={data.edital?.certame.percentualAdesao ? `${data.edital.certame.percentualAdesao}%` : null} />
                                <InfoField label="Vigência Ata (meses)" value={data.edital?.certame.vigenciaAtaMeses ? `${data.edital.certame.vigenciaAtaMeses} meses` : null} subValue={data.edital?.certame.vigenciaAtaMesesTexto} />
                                <InfoField label="Vigência Contrato (dias)" value={data.edital?.certame.vigenciaContratoDias ? `${data.edital.certame.vigenciaContratoDias} dias` : null} subValue={data.edital?.certame.vigenciaContratoDiasTexto} />
                            </div>
                        </SubGroup>
                    </div>
                </SectionCard>

                {/* 5. Execução Contratual */}
                <SectionCard title="Execução Contratual" icon={Truck} evidence={data.edital?.execucao.textoOriginal}>
                    <div className="space-y-4">
                        <SubGroup label="Entrega" evidence={data.edital?.execucao.entrega.textoOriginalLogistica}>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Prazo de Entrega" value={data.edital?.execucao.entrega.prazoEmDias ? `${data.edital.execucao.entrega.prazoEmDias} dias` : null} subValue={data.edital?.execucao.entrega.textoOriginal} />
                                <InfoField label="Tipo Entrega" value={data.edital?.execucao.entrega.tipoEntrega} isEnum />
                                <InfoField label="Instalação por" value={data.edital?.execucao.entrega.responsavelInstalacao} isEnum />
                                <InfoField label="Local de Entrega" value={data.edital?.execucao.entrega.localEntrega} fullWidth />
                            </div>
                        </SubGroup>
                        <SubGroup label="Aceite e Pagamento">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Validade Proposta" value={data.edital?.execucao.validadeProposta ? `${data.edital.execucao.validadeProposta} dias` : null} />
                                <InfoField label="Prazo Aceite" value={data.edital?.execucao.aceite.prazoEmDias ? `${data.edital.execucao.aceite.prazoEmDias} dias` : null} subValue={data.edital?.execucao.aceite.textoOriginal} />
                                <InfoField label="Prazo Pagamento" value={data.edital?.execucao.pagamento.prazoEmDias ? `${data.edital.execucao.pagamento.prazoEmDias} dias` : null} subValue={data.edital?.execucao.pagamento.textoOriginal} />
                            </div>
                        </SubGroup>
                        <SubGroup label="Garantia" evidence={data.edital?.execucao.garantia.textoOriginal}>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Tipo Garantia" value={data.edital?.execucao.garantia.tipo} isEnum />
                                <InfoField label="Duração (meses)" value={data.edital?.execucao.garantia.meses} />
                                <InfoField label="SLA Atendimento" value={data.edital?.execucao.garantia.tempoAtendimentoHoras ? `${data.edital.execucao.garantia.tempoAtendimentoHoras}h` : null} />
                            </div>
                        </SubGroup>
                    </div>
                </SectionCard>
            </div>

            {/* 6. Órgãos Participantes e Info Complementar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data.edital?.orgaosParticipantes ?? []).length > 0 && (
                    <SectionCard title="Órgãos Participantes" icon={Users2}>
                        <div className="space-y-4">
                            {data.edital?.orgaosParticipantes.map((org, i) => (
                                <div key={i} className="text-xs p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <p className="font-bold text-primary mb-1">{org.nome}</p>
                                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                        <span>CNPJ: {org.cnpj || "—"}</span>
                                        <span>{org.municipio}/{org.uf}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                <SectionCard title="Informações Adicionais" icon={Info}>
                    {data.edital?.informacaoComplementar ? (
                        <ul className="space-y-1.5">
                            {data.edital.informacaoComplementar.split(/\n-\s+/).filter(Boolean).map((item, i) => (
                                <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                                    <span className="text-primary/50 mt-0.5 shrink-0">•</span>
                                    <span>{item.replace(/^-\s*/, "")}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground/50 italic">Nenhuma informação adicional extraída.</p>
                    )}
                </SectionCard>
            </div>

            {/* 7. Documentos de Habilitação */}
            {data.edital?.habilitacao && data.edital.habilitacao.length > 0 && (
                <SectionCard title="Documentos de Habilitação" icon={ClipboardCheck}>
                    <div className="space-y-6">
                        {Object.entries(
                            (data.edital.habilitacao).reduce((acc, h) => {
                                const cat = h.categoria || "Outros";
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(h);
                                return acc;
                            }, {} as Record<string, typeof data.edital.habilitacao>)
                        ).map(([categoria, itens], idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase text-primary/70 tracking-tight">{categoria}</span>
                                    <Separator className="flex-1 opacity-50" />
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {(itens as typeof data.edital.habilitacao).map((h, i) => (
                                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors">
                                            <span className="text-sm font-medium pr-4 leading-tight">{h.tipo}</span>
                                            {h.obrigatorio && (
                                                <Badge className="shrink-0 bg-blue-100/80 text-blue-800 hover:bg-blue-100/80 border-blue-200 text-[10px] h-5">Obrigatório</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* 8. Itens */}
            {data.edital?.itens && data.edital.itens.length > 0 && (
                <SectionCard title="Itens da Licitação" icon={ListOrdered}>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px]">Nº</TableHead>
                                    <TableHead className="w-[70px]">Tipo</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[160px]">CATMAT/SER</TableHead>
                                    <TableHead className="w-[80px]">Lote</TableHead>
                                    <TableHead className="text-right w-[60px]">Qtd</TableHead>
                                    <TableHead className="w-[55px]">Unid.</TableHead>
                                    <TableHead className="text-right w-[110px]">Unit. Est.</TableHead>
                                    <TableHead className="text-right w-[110px]">Total Est.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.edital.itens.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-xs text-center">{item.numero ?? "—"}</TableCell>
                                        <TableCell>
                                            {item.tipo && (
                                                <Badge variant="outline" className={`text-[9px] font-bold ${item.tipo === "servico" ? "border-blue-200 text-blue-700" : "border-emerald-200 text-emerald-700"}`}>
                                                    {item.tipo === "servico" ? "SVC" : "MAT"}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-sm whitespace-normal">
                                            <div className="space-y-0.5">
                                                <p className="font-medium text-xs leading-snug line-clamp-2">{item.descricao}</p>
                                                {item.beneficioTributario && (
                                                    <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1 bg-amber-50 text-amber-700 border-amber-200">
                                                        {item.beneficioTributario}
                                                    </Badge>
                                                )}
                                                {item.observacao && (
                                                    <p className="text-[9px] text-muted-foreground/50 italic leading-tight">{item.observacao}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[10px] text-muted-foreground font-mono leading-snug whitespace-normal">
                                            {item.codigoCatmatCatser || "—"}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-mono">{item.lote || "—"}</TableCell>
                                        <TableCell className="text-right text-xs font-mono">{item.quantidade ?? "—"}</TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">{item.unidadeMedida || "—"}</TableCell>
                                        <TableCell className="text-right text-xs font-semibold text-primary">
                                            {item.valorUnitarioEstimado != null ? `R$ ${item.valorUnitarioEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-bold text-primary">
                                            {item.valorTotal != null ? `R$ ${item.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SectionCard>
            )}
        </div>
    );
}

// ─── Componentes de Apoio ───────────────────────────────────────────────────

 function SectionCard({ title, icon: Icon, children, evidence }: { title: string, icon: any, children: React.ReactNode, evidence?: string | null }) {
    const [showEvidence, setShowEvidence] = useState(false);

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                        </div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
                    </div>
                    {evidence && (
                        <button 
                            onClick={() => setShowEvidence(!showEvidence)}
                            className="text-[10px] text-primary font-bold uppercase hover:underline flex items-center gap-1"
                        >
                            {showEvidence ? "Ocultar Fonte" : "Ver Fonte"}
                        </button>
                    )}
                </div>
                
                <div className="flex-1">
                    {children}
                </div>

                {evidence && showEvidence && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono mb-2">Evidência Textual (Edital)</p>
                        <div className="p-3 rounded-md bg-slate-50 border border-slate-100 italic text-[11px] text-muted-foreground leading-relaxed">
                            "{evidence}"
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SubGroup({ label, children, evidence }: { label: string; children: React.ReactNode; evidence?: string | null }) {
    const [showEvidence, setShowEvidence] = useState(false);
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase text-primary/60 tracking-wide">{label}</p>
                {evidence && (
                    <button
                        onClick={() => setShowEvidence(v => !v)}
                        className="text-[10px] text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2"
                    >
                        {showEvidence ? "ocultar trecho" : "ver trecho"}
                    </button>
                )}
            </div>
            {showEvidence && evidence && (
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 italic text-[11px] text-muted-foreground leading-relaxed">
                    "{evidence}"
                </div>
            )}
            <div className="pl-2 border-l-2 border-primary/20">
                {children}
            </div>
        </div>
    );
}

function InfoField({ label, value, subValue, fullWidth, isBoolean, isDate, isEnum }: {
    label: string,
    value: any,
    subValue?: string | null,
    fullWidth?: boolean,
    isBoolean?: boolean,
    isDate?: boolean,
    isEnum?: boolean
}) {
    const [expanded, setExpanded] = useState(false);
    const hasValue = value !== null && value !== undefined && value !== "";
    const hasEvidence = !!(subValue?.trim());
    // Value is missing but text evidence exists — show as "found but unparsed"
    const valueAbsentWithEvidence = !hasValue && hasEvidence;

    let content: React.ReactNode = value;

    if (!hasValue) {
        content = valueAbsentWithEvidence
            ? <span className="text-amber-500/70 italic text-xs">não extraído</span>
            : <span className="text-muted-foreground/30 italic">—</span>;
    } else if (isBoolean) {
        content = (
            <Badge
                variant={value ? "default" : "secondary"}
                className={value ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" : "bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200"}
            >
                {value ? "Sim" : "Não"}
            </Badge>
        );
    } else if (isDate) {
        content = formatDate(String(value));
    } else if (isEnum) {
        content = <span className="capitalize">{String(value).replace(/_/g, " ")}</span>;
    } else if (typeof value === "string" || typeof value === "number") {
        content = <span>{value}</span>;
    }

    return (
        <div className={`space-y-0.5 ${fullWidth ? "col-span-2" : ""}`}>
            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider font-mono">{label}</p>
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="text-sm font-medium leading-tight">
                        {content}
                    </div>
                    {hasEvidence && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className={`text-[9px] underline underline-offset-2 transition-colors leading-none mt-0.5 ${
                                valueAbsentWithEvidence
                                    ? "text-amber-400 hover:text-amber-600"
                                    : "text-muted-foreground/40 hover:text-primary/60"
                            }`}
                        >
                            {expanded ? "ocultar" : "trecho"}
                        </button>
                    )}
                </div>
                {expanded && hasEvidence && (
                    <div className={`text-[10px] leading-relaxed italic p-2 rounded border mt-0.5 ${
                        valueAbsentWithEvidence
                            ? "text-amber-700 bg-amber-50/60 border-amber-100"
                            : "text-muted-foreground/60 bg-slate-50 border-slate-100"
                    }`}>
                        "{subValue}"
                    </div>
                )}
            </div>
        </div>
    );
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—"
    try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return new Intl.DateTimeFormat("pt-BR").format(date)
    } catch {
        return dateStr
    }
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

function formatBytes(bytes: number): string {
    if (bytes < 1024)           return `${bytes} B`
    if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── JsonView ───────────────────────────────────────────────────────────────

function JsonView({ data }: { data: any }) {
    if (typeof data !== "object" || data === null) {
        return <span className="text-blue-600">{JSON.stringify(data)}</span>;
    }

    if (Array.isArray(data)) {
        return (
            <div className="pl-4 border-l-2 border-slate-200/50 space-y-1">
                <span className="text-xs text-muted-foreground/50 font-mono">[</span>
                {data.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-xs text-muted-foreground/40 font-mono">{i}:</span>
                        <JsonView data={item} />
                    </div>
                ))}
                <span className="text-xs text-muted-foreground/50 font-mono">]</span>
            </div>
        );
    }

    return (
        <div className="pl-4 border-l-2 border-emerald-500/20 space-y-1.5 py-1">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-x-2">
                    <span className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-tighter shrink-0">{key}:</span>
                    <div className="flex-1 min-w-0">
                        {typeof value === "object" && value !== null ? (
                            <JsonView data={value} />
                        ) : (
                            <span className={`text-sm break-words ${typeof value === "number" ? "text-amber-600 font-bold" : typeof value === "boolean" ? "text-indigo-600 font-bold" : "text-slate-700"}`}>
                                {value === null ? <span className="text-muted-foreground/30 italic">null</span> : String(value)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
