"use client"

import { useMemo, useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  ExternalLink,
  Gavel,
  Landmark,
  LayoutDashboard,
  PackageSearch,
  Truck,
} from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card"
import { ScrollArea } from "@/client/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { cn } from "@/client/main/lib/utils"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

type Props = {
  result: ExtractEditalDataResponse
}

type ReviewTabId =
  | "identificacao"
  | "certame"
  | "items"
  | "orgaos"
  | "complementares"

type ReviewTab = {
  id: ReviewTabId
  label: string
  icon: LucideIcon
  badge?: string
}

type ExtractedLicitacao = ExtractEditalDataResponse["licitacao"]
type ExtractedEdital = NonNullable<ExtractedLicitacao["edital"]>
type ExtractedItem = ExtractedEdital["itens"][number]
type ExtractedQualification = ExtractedEdital["habilitacao"][number]

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const numberFormatter = new Intl.NumberFormat("pt-BR")

export function ExtractEditalReviewWorkspace({ result }: Props) {
  const [activeTab, setActiveTab] = useState<ReviewTabId>("identificacao")

  const licitacao = result.licitacao
  const edital = licitacao.edital
  const tabs = useMemo(() => buildReviewTabs(result), [result])

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-white">
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as ReviewTabId)}
        className="flex h-full min-h-0 w-full min-w-0 flex-col gap-0"
      >
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-4">
          <TabsList variant="line" className="grid h-auto w-full grid-cols-2 gap-2 p-0 lg:grid-cols-3 xl:grid-cols-5">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group h-auto min-h-11 min-w-0 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-left text-slate-600 shadow-none transition-colors data-[state=active]:border-sky-300 data-[state=active]:bg-sky-50 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <div className="flex w-full items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary transition-colors group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground">
                    <tab.icon className="size-3.5" />
                  </div>
                  <span className="min-w-0 flex-1 whitespace-normal text-sm font-semibold leading-5">{tab.label}</span>
                  {tab.badge ? (
                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-none transition-colors group-data-[state=active]:bg-sky-100 group-data-[state=active]:text-primary"
                    >
                      {tab.badge}
                    </Badge>
                  ) : null}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="min-h-full p-6 lg:p-7 xl:p-8">
              <TabsContent value="identificacao" className="mt-0 space-y-8">
                <ReviewHeader
                  eyebrow="Etapa 1"
                  title="Visão geral e cronograma"
                  description="Revise primeiro os dados centrais do processo e o calendário do certame na mesma ordem do cadastro."
                />

                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                  <DetailCard label="Número da licitação" value={licitacao.numeroLicitacao} />
                  <DetailCard label="Ano" value={formatOptionalNumber(licitacao.ano)} />
                  <DetailCard label="Processo" value={licitacao.processo} />
                  <DetailCard label="Modalidade" value={formatOptionalLabel(licitacao.modalidade)} />
                  <DetailCard label="Situação" value={licitacao.situacao} />
                  <DetailCard label="Registro de preço" value={formatOptionalBoolean(licitacao.srp)} />
                  <DetailCard label="Valor estimado" value={formatOptionalCurrency(licitacao.valorTotalEstimado)} />
                  <DetailCard label="Valor homologado" value={formatOptionalCurrency(licitacao.valorTotalHomologado)} />
                </div>

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Objeto da contratação</CardTitle>
                    <CardDescription>Resumo principal usado para abrir o cadastro da licitação.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LongTextBlock label="Objeto" value={licitacao.objeto} />
                  </CardContent>
                </Card>

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Cronograma do edital</CardTitle>
                    <CardDescription>Prazos e marcos operacionais identificados na leitura do documento.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                    <DetailCard label="Acolhimento início" value={edital?.cronograma.acolhimentoInicio} />
                    <DetailCard label="Acolhimento fim" value={edital?.cronograma.acolhimentoFim} />
                    <DetailCard label="Hora limite" value={edital?.cronograma.horaLimite} />
                    <DetailCard label="Sessão pública" value={edital?.cronograma.sessaoPublica} />
                    <DetailCard label="Hora da sessão" value={edital?.cronograma.horaSessaoPublica} />
                    <DetailCard label="Esclarecimentos até" value={edital?.cronograma.esclarecimentosAte} />
                    <DetailCard label="Impugnação até" value={edital?.cronograma.impugnacaoAte} />
                  </CardContent>
                </Card>

                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                  <DetailCard label="Data de publicação" value={licitacao.dataPublicacao} />
                  <DetailCard label="Última atualização" value={licitacao.dataUltimaAtualizacao} />
                  <DetailCard label="Identificador externo" value={licitacao.identificadorExterno} />
                  <LinkCard label="Link do processo" value={licitacao.linkProcesso} />
                </div>
              </TabsContent>

              <TabsContent value="certame" className="mt-0 space-y-8">
                <ReviewHeader
                  eyebrow="Etapa 2"
                  title="Regras, execução e habilitação"
                  description="Confira as condições do certame, a execução contratual e os documentos exigidos exatamente como o formulário organiza esse bloco."
                />

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Regras do certame</CardTitle>
                    <CardDescription>Condições comerciais e operacionais capturadas do edital.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                    <DetailCard label="Modo de disputa" value={edital?.certame.modoDisputa} />
                    <DetailCard label="Critério de julgamento" value={edital?.certame.criterioJulgamento} />
                    <DetailCard label="Tipo de lance" value={formatOptionalLabel(edital?.certame.tipoLance)} />
                    <DetailCard label="Intervalo de lances" value={edital?.certame.intervaloLances} />
                    <DetailCard label="Duração da sessão" value={formatMinutes(edital?.certame.duracaoSessaoMinutos)} />
                    <DetailCard label="Regionalidade" value={edital?.certame.regionalidade} />
                    <DetailCard label="Exclusivo ME/EPP" value={formatOptionalBoolean(edital?.certame.exclusivoMeEpp)} />
                    <DetailCard label="Permite consórcio" value={formatOptionalBoolean(edital?.certame.permiteConsorcio)} />
                    <DetailCard label="Exige visita técnica" value={formatOptionalBoolean(edital?.certame.exigeVisitaTecnica)} />
                    <DetailCard label="Permite adesão" value={formatOptionalBoolean(edital?.certame.permiteAdesao)} />
                    <DetailCard label="Percentual de adesão" value={formatOptionalNumber(edital?.certame.percentualAdesao)} />
                    <DetailCard label="Vigência da ata" value={formatMonths(edital?.certame.vigenciaAtaMeses)} />
                    <DetailCard label="Vigência do contrato" value={formatDays(edital?.certame.vigenciaContratoDias)} />
                    <DetailCard label="DIFAL" value={formatOptionalBoolean(edital?.certame.difal)} />
                  </CardContent>
                </Card>

                <div className="grid gap-4 2xl:grid-cols-2">
                  <SectionCard title="Entrega" description="Prazos, local e responsabilidades da entrega.">
                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                      <DetailCard label="Prazo de entrega" value={formatDays(edital?.execucao.entrega.prazoEmDias)} />
                      <DetailCard label="Local de entrega" value={edital?.execucao.entrega.localEntrega} className="md:col-span-2" />
                      <DetailCard label="Tipo de entrega" value={formatOptionalLabel(edital?.execucao.entrega.tipoEntrega)} />
                      <DetailCard label="Responsável pela instalação" value={formatOptionalLabel(edital?.execucao.entrega.responsavelInstalacao)} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Pagamento, aceite e validade" description="Condições de aceite e compromisso comercial da proposta.">
                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                      <DetailCard label="Prazo de pagamento" value={formatDays(edital?.execucao.pagamento.prazoEmDias)} />
                      <DetailCard label="Prazo de aceite" value={formatDays(edital?.execucao.aceite.prazoEmDias)} />
                      <DetailCard label="Validade da proposta" value={formatDays(edital?.execucao.validadeProposta)} className="md:col-span-2" />
                    </div>
                  </SectionCard>

                  <SectionCard title="Garantia" description="Modelo e janela de atendimento informados no edital.">
                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                      <DetailCard label="Tipo de garantia" value={formatOptionalLabel(edital?.execucao.garantia.tipo)} />
                      <DetailCard label="Meses de garantia" value={formatOptionalNumber(edital?.execucao.garantia.meses)} />
                      <DetailCard label="Atendimento" value={formatHours(edital?.execucao.garantia.tempoAtendimentoHoras)} />
                    </div>
                  </SectionCard>
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                  {buildQualificationGroups(edital?.habilitacao ?? []).map(group => (
                    <Card key={group.category} className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{group.category}</CardTitle>
                        <CardDescription>{group.items.length} documento(s) identificado(s)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {group.items.length ? (
                          <div className="space-y-3">
                            {group.items.map((item, index) => (
                              <div
                                key={`${item.tipo}-${index}`}
                                className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-primary">{item.tipo}</p>
                                  {item.obrigatorio ? (
                                    <Badge className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-100">
                                      Obrigatório
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                                      Opcional
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            title="Sem documentos nesta categoria"
                            description="Nenhum documento de habilitação foi consolidado nesse grupo."
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="items" className="mt-0 space-y-8">
                <ReviewHeader
                  eyebrow="Etapa 3"
                  title="Itens licitados"
                  description="Revise a tabela de itens na mesma etapa em que eles entram no formulário."
                />

                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                  <MetricCard label="Itens encontrados" value={String(edital?.itens.length ?? 0)} />
                  <MetricCard label="Lotes com referência" value={String(countItemsWithValue(edital?.itens ?? [], "lote"))} />
                  <MetricCard label="Itens com valor unitário" value={String(countItemsWithValue(edital?.itens ?? [], "valorUnitarioEstimado"))} />
                  <MetricCard label="Total estimado somado" value={formatOptionalCurrency(sumItemTotals(edital?.itens ?? []))} />
                </div>

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tabela de itens</CardTitle>
                    <CardDescription>
                      {edital?.itens.length
                        ? "Lista consolidada dos itens reconhecidos pela IA."
                        : "Nenhum item foi consolidado na extração."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {edital?.itens.length ? (
                      <Table className="min-w-[860px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Lote</TableHead>
                            <TableHead className="w-[38%] min-w-[280px]">Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Qtd.</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Valor unit.</TableHead>
                            <TableHead>Valor total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {edital.itens.map((item, index) => (
                            <TableRow key={`${item.numero ?? index}-${item.descricao ?? "item"}`}>
                              <TableCell>{formatOptionalNumber(item.numero) ?? String(index + 1)}</TableCell>
                              <TableCell>{formatDisplayValue(item.lote)}</TableCell>
                              <TableCell className="whitespace-normal">
                                <div className="space-y-2">
                                  <p className="font-medium text-primary">{formatDisplayValue(item.descricao)}</p>
                                  {(item.codigoCatmatCatser || item.criterioJulgamento) ? (
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      {item.codigoCatmatCatser ? (
                                        <span className="rounded-full bg-slate-100 px-2 py-1">
                                          CATMAT/CATSER {item.codigoCatmatCatser}
                                        </span>
                                      ) : null}
                                      {item.criterioJulgamento ? (
                                        <span className="rounded-full bg-slate-100 px-2 py-1">
                                          {item.criterioJulgamento}
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>{formatOptionalLabel(item.tipo)}</TableCell>
                              <TableCell>{formatOptionalNumber(item.quantidade)}</TableCell>
                              <TableCell>{formatDisplayValue(item.unidadeMedida)}</TableCell>
                              <TableCell>{formatOptionalCurrency(item.valorUnitarioEstimado)}</TableCell>
                              <TableCell>{formatOptionalCurrency(item.valorTotal)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title="Nenhum item listado"
                        description="Se o PDF tiver tabela difícil de ler, vale revisar o arquivo original antes de aplicar."
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orgaos" className="mt-0 space-y-8">
                <ReviewHeader
                  eyebrow="Etapa 4"
                  title="Órgãos da contratação"
                  description="Órgão gerenciador e participantes organizados na mesma etapa institucional do formulário."
                />

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Órgão gerenciador</CardTitle>
                    <CardDescription>Dados principais do órgão público vinculado ao processo.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                    <DetailCard label="Nome" value={licitacao.orgaoGerenciador?.nome} />
                    <DetailCard label="CNPJ" value={licitacao.orgaoGerenciador?.cnpj} />
                    <DetailCard label="Código da unidade" value={licitacao.orgaoGerenciador?.codigoUnidade} />
                    <DetailCard label="Nome da unidade" value={licitacao.orgaoGerenciador?.nomeUnidade} />
                    <DetailCard label="Município" value={licitacao.orgaoGerenciador?.municipio} />
                    <DetailCard label="UF" value={licitacao.orgaoGerenciador?.uf} />
                    <DetailCard label="Esfera" value={formatOptionalLabel(licitacao.orgaoGerenciador?.esfera)} />
                    <DetailCard label="Poder" value={formatOptionalLabel(licitacao.orgaoGerenciador?.poder)} />
                  </CardContent>
                </Card>

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Órgãos participantes</CardTitle>
                    <CardDescription>
                      {edital?.orgaosParticipantes.length
                        ? "Participantes encontrados na leitura do edital."
                        : "Nenhum órgão participante foi identificado na extração."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {edital?.orgaosParticipantes.length ? (
                      <div className="grid gap-4 xl:grid-cols-2">
                        {edital.orgaosParticipantes.map((orgao, index) => (
                          <div
                            key={`${orgao.codigoUnidade ?? orgao.cnpj ?? "orgao"}-${index}`}
                            className="rounded-[1.15rem] border border-slate-200/70 bg-slate-50/60 p-4"
                          >
                            <p className="text-sm font-semibold text-primary">
                              {orgao.nome ?? `Órgão participante ${index + 1}`}
                            </p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <InlineDetail label="CNPJ" value={orgao.cnpj} />
                              <InlineDetail label="Código" value={orgao.codigoUnidade} />
                              <InlineDetail label="Município" value={orgao.municipio} />
                              <InlineDetail label="UF" value={orgao.uf} />
                              <InlineDetail label="Esfera" value={formatOptionalLabel(orgao.esfera)} />
                              <InlineDetail label="Poder" value={formatOptionalLabel(orgao.poder)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="Nenhum participante adicional"
                        description="A IA não encontrou outras unidades participantes além do órgão principal."
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="complementares" className="mt-0 space-y-8">
                <ReviewHeader
                  eyebrow="Etapa 6"
                  title="Informações complementares"
                  description="Base legal e observações livres mantidas no fechamento do fluxo, como no formulário de cadastro."
                />

                <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Contexto complementar do edital</CardTitle>
                    <CardDescription>Campos livres e fundamento legal que ajudam a completar a leitura do processo.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <LongTextBlock label="Amparo legal" value={edital?.amparoLegal} />
                    <LongTextBlock label="Informação complementar" value={edital?.informacaoComplementar} />
                  </CardContent>
                </Card>
              </TabsContent>

            </div>
          </ScrollArea>
        </div>
      </Tabs>
    </section>
  )
}

function buildReviewTabs(result: ExtractEditalDataResponse): ReviewTab[] {
  const edital = result.licitacao.edital

  return [
    {
      id: "identificacao",
      label: "Visão geral e cronograma",
      icon: LayoutDashboard,
    },
    {
      id: "certame",
      label: "Regras, execução e habilitação",
      icon: Gavel,
      badge: String(edital?.habilitacao.length ?? 0),
    },
    {
      id: "items",
      label: "Itens licitados",
      icon: PackageSearch,
      badge: String(result.metrics.itemsExtracted),
    },
    {
      id: "orgaos",
      label: "Órgãos da contratação",
      icon: Landmark,
      badge: String(edital?.orgaosParticipantes.length ?? 0),
    },
    {
      id: "complementares",
      label: "Informações complementares",
      icon: Truck,
    },
  ]
}

function ReviewHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      <div>
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-primary">{title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="rounded-[1.35rem] border-slate-200/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DetailCard({
  label,
  value,
  className,
}: {
  label: string
  value: string | null | undefined
  className?: string
}) {
  return (
    <div className={cn("min-w-0 rounded-[1.1rem] border border-slate-200/70 bg-slate-50/60 px-4 py-3", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 whitespace-normal leading-4">{label}</p>
      <p className="mt-2 whitespace-normal break-words text-sm font-medium leading-6 text-primary">
        {formatDisplayValue(value)}
      </p>
    </div>
  )
}

function LinkCard({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  const href = value?.trim()

  return (
    <div className="min-w-0 rounded-[1.1rem] border border-slate-200/70 bg-slate-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 whitespace-normal leading-4">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-2 whitespace-normal break-words text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Abrir processo
          <ExternalLink className="size-4" />
        </a>
      ) : (
        <p className="mt-2 text-sm font-medium text-primary">Não informado</p>
      )}
    </div>
  )
}

function LongTextBlock({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-slate-200/70 bg-slate-50/60 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 whitespace-normal leading-4">{label}</p>
      <p className="mt-3 whitespace-normal break-words text-sm leading-7 text-primary">{formatDisplayValue(value)}</p>
    </div>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-[1.15rem] border border-slate-200/70 bg-white px-4 py-4 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.14)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 whitespace-normal leading-4">{label}</p>
      <p className="mt-3 whitespace-normal break-words text-xl font-semibold tracking-[-0.02em] text-primary">{value}</p>
    </div>
  )
}

function InlineDetail({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 whitespace-normal leading-4">{label}</p>
      <p className="whitespace-normal break-words text-sm font-medium text-primary">{formatDisplayValue(value)}</p>
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.2)]">
        <CheckCircle2 className="size-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function buildQualificationGroups(items: ExtractedQualification[]) {
  const grouped = new Map<string, ExtractedQualification[]>()

  for (const item of items) {
    const current = grouped.get(item.categoria) ?? []
    current.push(item)
    grouped.set(item.categoria, current)
  }

  const order = [
    "Jurídica",
    "Fiscal e Trabalhista",
    "Qualificação Técnica",
    "Qualificação Econômica",
  ]

  return order.map(category => ({
    category,
    items: grouped.get(category) ?? [],
  }))
}

function countItemsWithValue(items: ExtractedItem[], field: keyof ExtractedItem) {
  return items.reduce((count, item) => {
    const value = item[field]

    if (value == null) return count
    if (typeof value === "string" && !value.trim()) return count

    return count + 1
  }, 0)
}

function sumItemTotals(items: ExtractedItem[]) {
  const sum = items.reduce((total, item) => total + (item.valorTotal ?? 0), 0)
  return sum > 0 ? sum : null
}

function formatDisplayValue(value: string | null | undefined) {
  return value?.trim() ? value : "Não informado"
}

function formatOptionalBoolean(value: boolean | null | undefined) {
  if (value == null) return "Não informado"
  return value ? "Sim" : "Não"
}

function formatOptionalNumber(value: number | null | undefined) {
  if (value == null) return null
  return numberFormatter.format(value)
}

function formatOptionalCurrency(value: number | null | undefined) {
  if (value == null) return "Não informado"
  return currencyFormatter.format(value)
}

function formatOptionalLabel(value: string | null | undefined) {
  if (!value?.trim()) return "Não informado"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase())
}

function formatDuration(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)}s`
}

function formatMinutes(value: number | null | undefined) {
  if (value == null) return "Não informado"
  return `${numberFormatter.format(value)} min`
}

function formatDays(value: number | null | undefined) {
  if (value == null) return "Não informado"
  return `${numberFormatter.format(value)} dia(s)`
}

function formatMonths(value: number | null | undefined) {
  if (value == null) return "Não informado"
  return `${numberFormatter.format(value)} mês(es)`
}

function formatHours(value: number | null | undefined) {
  if (value == null) return "Não informado"
  return `${numberFormatter.format(value)} hora(s)`
}
