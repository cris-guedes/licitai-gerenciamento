"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select"
import { Switch } from "@/client/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table"
import { Textarea } from "@/client/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip"
import { cn } from "@/client/main/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  ClipboardList,
  FileText,
  Gavel,
  LoaderCircle,
  Package2,
  Plus,
  Trash2,
} from "lucide-react"
import { Controller, useFieldArray, useWatch, type FieldPath, type UseFormReturn } from "react-hook-form"
import type { KnownOrgaoOption } from "../../services/use-licitacao.service"
import {
  BOOLEAN_OPTIONS,
  ESFERA_OPTIONS,
  GARANTIA_TIPO_OPTIONS,
  PODER_OPTIONS,
  RESPONSAVEL_INSTALACAO_OPTIONS,
  SITUACAO_OPTIONS,
  TIPO_ENTREGA_OPTIONS,
  TIPO_ITEM_OPTIONS,
  TIPO_LANCE_OPTIONS,
  createEmptyDocumentoHabilitacaoFormValues,
  createEmptyItemLicitadoFormValues,
  createEmptyOrgaoPublicoFormValues,
  type NovaLicitacaoFormValues,
  type SelectOption,
} from "../../schemas/nova-licitacao.schema"

type Props = {
  form: UseFormReturn<NovaLicitacaoFormValues>
  onSubmit: (values: NovaLicitacaoFormValues) => void | Promise<unknown>
  knownOrgaos: KnownOrgaoOption[]
  isLoadingKnownOrgaos?: boolean
  isSubmitting?: boolean
  submitError?: string | null
  isCompleted?: boolean
}

type FormPath = FieldPath<NovaLicitacaoFormValues>
type FieldGuide = {
  description: string
  placeholder?: string
}

const FORM_STEPS = [
  {
    id: "identificacao",
    title: "Visão geral e cronograma",
    description: "Abra o cadastro pelo bloco que costuma aparecer primeiro no edital: identificação da licitação, valores centrais e cronograma da disputa.",
    eyebrow: "Etapa 1",
    icon: ClipboardList,
  },
  {
    id: "certame",
    title: "Regras, execução e habilitação",
    description: "Agrupe em sequência as regras da disputa, as condições de execução contratual e a documentação de habilitação exigida.",
    eyebrow: "Etapa 2",
    icon: Gavel,
  },
  {
    id: "itens",
    title: "Itens licitados",
    description: "Defina os itens do edital com quantidades, valores, classificações e observações centrais da contratação.",
    eyebrow: "Etapa 3",
    icon: Package2,
  },
  {
    id: "participantes-habilitacao",
    title: "Órgãos da contratação",
    description: "Depois de definir os itens, organize o órgão gerenciador e os órgãos participantes que compõem a contratação compartilhada.",
    eyebrow: "Etapa 4",
    icon: Building2,
  },
  {
    id: "informacoes-complementares",
    title: "Informações complementares",
    description: "Use a etapa final para registrar fundamentos legais e observações adicionais que complementam a leitura do edital, sem misturar esses dados ao núcleo operacional.",
    eyebrow: "Etapa 5",
    icon: FileText,
  },
] as const

type FieldGuideScope =
  | "identificacao"
  | "orgao-gerenciador"
  | "edital-geral"
  | "certame"
  | "execucao"
  | "participantes-habilitacao"
  | "informacoes-complementares"
  | "itens"

const STEP_FIELD_GUIDES: Record<FieldGuideScope, Record<string, FieldGuide>> = {
  identificacao: {
    numeroLicitacao: {
      description: "Número sequencial da licitação no exercício do órgão. É uma das formas mais rápidas de identificar o processo.",
      placeholder: "045/2024",
    },
    ano: {
      description: "Ano do exercício em que o processo foi aberto ou publicado.",
      placeholder: "2024",
    },
    processo: {
      description: "Número do processo administrativo interno que originou a licitação. Pode ser diferente do número do edital.",
      placeholder: "000.123/2024-11",
    },
    modalidade: {
      description: "Modalidade licitatória adotada pelo órgão, como pregão, concorrência ou dispensa.",
      placeholder: "pregao_eletronico",
    },
    situacao: {
      description: "Situação atual do processo no seu ciclo de vida, como publicada, em andamento ou homologada.",
    },
    srp: {
      description: "Indica se o processo gera ata de registro de preços, permitindo adesões futuras de outros órgãos.",
    },
    valorTotalEstimado: {
      description: "Valor total estimado pelo órgão antes da disputa, publicado como referência no edital.",
      placeholder: "150000.00",
    },
    valorTotalHomologado: {
      description: "Valor efetivamente homologado após a disputa. Esse campo costuma ser preenchido quando o processo já foi encerrado.",
      placeholder: "142800.00",
    },
    dataPublicacao: {
      description: "Data em que o processo foi publicado no portal de origem.",
    },
    dataUltimaAtualizacao: {
      description: "Data da última atualização identificada no processo, útil para rastrear mudanças e retificações.",
    },
    linkProcesso: {
      description: "Link direto para o processo no portal oficial de origem, facilitando auditoria e conferência da fonte primária.",
      placeholder: "https://portal.exemplo.gov.br/processo/123",
    },
    identificadorExterno: {
      description: "Identificador único do processo em sistemas externos, como PNCP ou Compras.gov.",
      placeholder: "PNCP-12345678901234-1-000045/2024",
    },
    objeto: {
      description: "Resumo do que o órgão pretende adquirir ou contratar. Deve permitir reconhecer o escopo da oportunidade rapidamente.",
      placeholder: "Registro de preços para aquisição de notebooks, monitores e acessórios de TI.",
    },
  },
  "orgao-gerenciador": {
    "orgao.nome": {
      description: "Nome oficial do órgão ou entidade pública que conduz a licitação.",
      placeholder: "Prefeitura Municipal de Exemplo",
    },
    "orgao.cnpj": {
      description: "CNPJ do órgão responsável pelo processo licitatório.",
      placeholder: "12.345.678/0001-90",
    },
    "orgao.codigoUnidade": {
      description: "Código da unidade gestora ou administrativa responsável, como uma UASG.",
      placeholder: "UASG 987654",
    },
    "orgao.nomeUnidade": {
      description: "Nome da unidade gestora que operacionaliza a contratação dentro do órgão.",
      placeholder: "Secretaria Municipal de Administração",
    },
    "orgao.municipio": {
      description: "Município sede do órgão responsável pela contratação.",
      placeholder: "Cuiabá",
    },
    "orgao.uf": {
      description: "Sigla da unidade federativa do órgão responsável.",
      placeholder: "MT",
    },
    "orgao.esfera": {
      description: "Nível de governo ao qual o órgão pertence: federal, estadual ou municipal.",
    },
    "orgao.poder": {
      description: "Poder ao qual o órgão está vinculado, como executivo, legislativo ou judiciário.",
    },
    "itemSolicitado.itemId": {
      description: "Selecione um item já cadastrado na etapa de itens para vincular a quantidade ao órgão gerenciador.",
    },
    "itemSolicitado.quantidade": {
      description: "Quantidade que o órgão gerenciador pretende demandar para esse item específico.",
      placeholder: "250",
    },
  },
  "edital-geral": {
    "edital.amparoLegal": {
      description: "Base legal que autoriza ou enquadra a forma de contratação descrita no edital.",
      placeholder: "Lei 14.133/2021, art. 28, inciso I.",
    },
    "edital.informacaoComplementar": {
      description: "Observações livres, notas do pregoeiro ou informações adicionais que não se encaixam nos demais blocos.",
      placeholder: "Entrega parcelada conforme cronograma do órgão e disponibilidade orçamentária.",
    },
    "cronograma.acolhimentoInicio": {
      description: "Data a partir da qual o sistema passa a receber propostas dos fornecedores.",
    },
    "cronograma.acolhimentoFim": {
      description: "Data final para envio ou acolhimento das propostas.",
    },
    "cronograma.horaLimite": {
      description: "Horário limite para envio das propostas ou documentos, quando o edital explicita essa informação separadamente.",
    },
    "cronograma.sessaoPublica": {
      description: "Data da sessão pública em que a disputa será conduzida.",
    },
    "cronograma.horaSessaoPublica": {
      description: "Horário em que a sessão pública será aberta no sistema.",
    },
    "cronograma.esclarecimentosAte": {
      description: "Prazo final para solicitação de esclarecimentos ao órgão.",
    },
    "cronograma.impugnacaoAte": {
      description: "Prazo final para apresentação de impugnações ao edital.",
    },
  },
  certame: {
    modoDisputa: {
      description: "Define a dinâmica competitiva da sessão, como aberto, fechado ou aberto-fechado.",
      placeholder: "aberto_fechado",
    },
    criterioJulgamento: {
      description: "Critério principal usado para escolher a proposta vencedora, como menor preço ou maior desconto.",
      placeholder: "menor_preco",
    },
    tipoLance: {
      description: "Indica se os lances são ofertados por valor unitário, valor global ou percentual.",
    },
    intervaloLances: {
      description: "Intervalo mínimo aceitável entre lances sucessivos, quando houver essa regra.",
      placeholder: "R$ 100,00",
    },
    duracaoSessaoMinutos: {
      description: "Duração prevista para a sessão pública ou para a fase de lances, quando expressa em minutos.",
      placeholder: "30",
    },
    regionalidade: {
      description: "Restrição geográfica ou preferência regional aplicável ao fornecimento ou à participação.",
      placeholder: "Entrega apenas na região Centro-Oeste.",
    },
    percentualAdesao: {
      description: "Percentual máximo permitido para adesão à ata, quando o edital trouxer esse limite.",
      placeholder: "100",
    },
    difal: {
      description: "Indica se o edital menciona diferencial de alíquota aplicável à operação.",
    },
    exclusivoMeEpp: {
      description: "Indica se a disputa é exclusiva para microempresas e empresas de pequeno porte.",
    },
    permiteConsorcio: {
      description: "Indica se fornecedores podem participar em consórcio.",
    },
    exigeVisitaTecnica: {
      description: "Indica se o fornecedor precisa realizar visita técnica como condição de participação.",
    },
    permiteAdesao: {
      description: "Indica se outros órgãos poderão aderir à ata ou contrato decorrente desse certame.",
    },
    vigenciaAtaMeses: {
      description: "Prazo de vigência da ata de registro de preços, normalmente expresso em meses.",
      placeholder: "12",
    },
    vigenciaContratoDias: {
      description: "Prazo de vigência do contrato, quando expresso em dias corridos ou úteis.",
      placeholder: "365",
    },
  },
  execucao: {
    "entrega.prazoEmDias": {
      description: "Prazo em dias para entrega do objeto contratado após a solicitação ou assinatura.",
      placeholder: "30",
    },
    "entrega.localEntrega": {
      description: "Endereço ou unidade onde os itens devem ser entregues.",
      placeholder: "Almoxarifado Central - Rua Exemplo, 123.",
    },
    "entrega.tipoEntrega": {
      description: "Informa se a entrega ocorrerá em um único local ou de forma descentralizada entre unidades.",
    },
    "entrega.responsavelInstalacao": {
      description: "Define quem responde pela instalação do bem ou solução adquirida.",
    },
    "pagamento.prazoEmDias": {
      description: "Prazo em dias para pagamento ao fornecedor após aceite ou apresentação da nota fiscal.",
      placeholder: "30",
    },
    "aceite.prazoEmDias": {
      description: "Prazo em dias para o órgão realizar o aceite formal do objeto entregue.",
      placeholder: "10",
    },
    validadeProposta: {
      description: "Período, em dias, durante o qual o fornecedor permanece vinculado à proposta apresentada.",
      placeholder: "60",
    },
    "garantia.tipo": {
      description: "Modalidade de atendimento da garantia técnica, como onsite, balcão ou remota.",
    },
    "garantia.meses": {
      description: "Duração da garantia técnica do bem ou serviço, normalmente em meses.",
      placeholder: "12",
    },
    "garantia.tempoAtendimentoHoras": {
      description: "Tempo máximo de resposta ou atendimento para chamados de garantia, em horas.",
      placeholder: "48",
    },
  },
  "participantes-habilitacao": {
    "orgao.nome": {
      description: "Nome oficial do órgão participante ou aderente ao processo compartilhado.",
      placeholder: "Secretaria Estadual de Educação",
    },
    "orgao.cnpj": {
      description: "CNPJ do órgão participante.",
      placeholder: "98.765.432/0001-10",
    },
    "orgao.codigoUnidade": {
      description: "Código da unidade gestora do órgão participante, quando o edital detalhar essa informação.",
      placeholder: "UASG 123456",
    },
    "orgao.nomeUnidade": {
      description: "Nome da unidade do órgão participante responsável pela demanda.",
      placeholder: "Coordenadoria de Compras",
    },
    "orgao.municipio": {
      description: "Município sede do órgão participante.",
      placeholder: "Várzea Grande",
    },
    "orgao.uf": {
      description: "Sigla da unidade federativa do órgão participante.",
      placeholder: "MT",
    },
    "orgao.esfera": {
      description: "Esfera de governo do órgão participante: federal, estadual ou municipal.",
    },
    "orgao.poder": {
      description: "Poder ao qual o órgão participante está vinculado.",
    },
    "itemSolicitado.itemId": {
      description: "Selecione um item já cadastrado na etapa de itens para vincular a quantidade ao órgão participante.",
    },
    "itemSolicitado.quantidade": {
      description: "Quantidade específica solicitada por esse órgão participante para o item informado.",
      placeholder: "80",
    },
    "habilitacao.tipo": {
      description: "Identificador semântico do documento exigido, preferencialmente em snake_case descritivo.",
      placeholder: "certidao_fgts",
    },
    "habilitacao.categoria": {
      description: "Grupo ao qual o documento pertence, como Jurídica, Fiscal, Técnica ou Econômico-financeira.",
      placeholder: "Fiscal e Trabalhista",
    },
    "habilitacao.obrigatorio": {
      description: "Indica se a apresentação do documento é obrigatória para participação no certame.",
    },
  },
  "informacoes-complementares": {
    "edital.amparoLegal": {
      description: "Base legal que autoriza ou enquadra a forma de contratação descrita no edital.",
      placeholder: "Lei 14.133/2021, art. 28, inciso I.",
    },
    "edital.informacaoComplementar": {
      description: "Observações livres, notas do pregoeiro ou informações adicionais que não se encaixam nos demais blocos.",
      placeholder: "Entrega parcelada conforme cronograma do órgão e disponibilidade orçamentária.",
    },
  },
  itens: {
    "item.numero": {
      description: "Número sequencial do item conforme apresentado no edital.",
      placeholder: "1",
    },
    "item.tipo": {
      description: "Classifica o item como material físico ou prestação de serviço.",
    },
    "item.lote": {
      description: "Identificador do lote ao qual o item pertence, quando houver agrupamento.",
      placeholder: "Lote 01",
    },
    "item.unidadeMedida": {
      description: "Unidade de medida usada para quantificar o item, como UN, KG, M² ou HORA.",
      placeholder: "UN",
    },
    "item.quantidade": {
      description: "Quantidade estimada a ser adquirida para esse item.",
      placeholder: "50",
    },
    "item.valorUnitarioEstimado": {
      description: "Valor unitário estimado pelo órgão para cada unidade do item.",
      placeholder: "3500.00",
    },
    "item.valorTotal": {
      description: "Valor total estimado para o item, considerando quantidade multiplicada pelo valor unitário.",
      placeholder: "175000.00",
    },
    "item.criterioJulgamento": {
      description: "Critério de julgamento específico do item, quando diferente do critério geral do certame.",
      placeholder: "menor_preco",
    },
    "item.codigoNcmNbs": {
      description: "Código NCM ou NBS aplicável ao item, quando o edital explicita esse enquadramento.",
      placeholder: "84713012",
    },
    "item.descricaoNcmNbs": {
      description: "Descrição textual correspondente ao código NCM ou NBS informado.",
      placeholder: "Máquinas automáticas portáteis para processamento de dados.",
    },
    "item.codigoCatmatCatser": {
      description: "Código do catálogo oficial de materiais ou serviços usado pelo órgão, como CATMAT ou CATSER.",
      placeholder: "451020",
    },
    "item.beneficioTributario": {
      description: "Benefício tributário ou regime fiscal aplicável ao item, quando houver previsão no edital.",
      placeholder: "Margem de preferência para produção nacional.",
    },
    "item.descricao": {
      description: "Descrição detalhada do bem ou serviço a ser contratado, incluindo especificações importantes.",
      placeholder: "Notebook corporativo com tela de 14 polegadas, 16GB RAM, SSD 512GB e garantia onsite.",
    },
    "item.observacao": {
      description: "Informações complementares, ressalvas ou observações específicas do item.",
      placeholder: "Aceita equipamento equivalente desde que mantenha desempenho mínimo exigido.",
    },
  },
}

function getFieldGuide(stepId: FieldGuideScope, key: string): FieldGuide | undefined {
  return STEP_FIELD_GUIDES[stepId][key]
}

function toNumber(value: string | number | null | undefined) {
  if (value == null || value === "") return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function formatNumberToCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatKnownOrgaoOptionLabel(orgao: KnownOrgaoOption) {
  const primary = orgao.nome || orgao.nomeUnidade || orgao.cnpj || "Órgão cadastrado"
  const secondary = [
    orgao.nomeUnidade && orgao.nomeUnidade !== orgao.nome ? orgao.nomeUnidade : "",
    orgao.municipio,
    orgao.uf,
  ]
    .filter(Boolean)
    .join(" / ")

  if (secondary && orgao.cnpj) return `${primary} — ${secondary} · ${orgao.cnpj}`
  if (secondary) return `${primary} — ${secondary}`
  if (orgao.cnpj) return `${primary} · ${orgao.cnpj}`
  return primary
}

function applyKnownOrgaoSelection({
  form,
  prefix,
  orgao,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  prefix: FormPath
  orgao: KnownOrgaoOption
}) {
  const fieldUpdates = [
    ["nome", orgao.nome],
    ["cnpj", orgao.cnpj],
    ["codigoUnidade", orgao.codigoUnidade],
    ["nomeUnidade", orgao.nomeUnidade],
    ["municipio", orgao.municipio],
    ["uf", orgao.uf],
    ["esfera", orgao.esfera],
    ["poder", orgao.poder],
  ] as const

  for (const [fieldName, value] of fieldUpdates) {
    form.setValue(`${prefix}.${fieldName}` as FormPath, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }
}

export function NovaLicitacaoForm({
  form,
  onSubmit,
  knownOrgaos,
  isLoadingKnownOrgaos = false,
  isSubmitting = false,
  submitError = null,
  isCompleted = false,
}: Props) {
  const orgaosParticipantes = useFieldArray({
    control: form.control,
    name: "edital.orgaosParticipantes",
  })
  const habilitacao = useFieldArray({
    control: form.control,
    name: "edital.habilitacao",
  })
  const itens = useFieldArray({
    control: form.control,
    name: "edital.itens",
  })
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const watchedItens = useWatch({
    control: form.control,
    name: "edital.itens",
  })
  const [itemActiveState, setItemActiveState] = React.useState<Record<string, boolean>>({})

  const currentStep = FORM_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1
  const resolvedItens = React.useMemo(
    () => (watchedItens ?? []).map(item => ({
      ...item,
      ativo: item.itemId ? (itemActiveState[item.itemId] ?? true) : true,
    })),
    [itemActiveState, watchedItens],
  )
  const activeItemsCount = React.useMemo(
    () => resolvedItens.filter(item => item.ativo).length,
    [resolvedItens],
  )
  const activeItemsTotal = React.useMemo(
    () => resolvedItens.reduce((sum, item) => {
      if (!item.ativo) return sum
      return sum + toNumber(item.valorTotal)
    }, 0),
    [resolvedItens],
  )

  function goToStep(index: number) {
    if (index < 0 || index >= FORM_STEPS.length) return
    setCurrentStepIndex(index)
  }

  function setItemActive(itemId: string, checked: boolean) {
    setItemActiveState(current => ({
      ...current,
      [itemId]: checked,
    }))
  }

  return (
    <TooltipProvider delayDuration={120}>
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="overflow-hidden rounded-lg border-0 bg-white">
            <SimpleStepper
              steps={FORM_STEPS}
              currentStepIndex={currentStepIndex}
              onStepClick={goToStep}
              className="rounded-none bg-surface-container-lowest px-5 py-5 shadow-none md:px-6 md:py-6"
            />

            <CardContent className="space-y-6 p-5 pt-5 md:p-6 md:pt-5">
              <div className="space-y-8">
              {currentStep.id === "identificacao" && (
                <>
                  <StepSection
                    title="Visão geral da licitação"
                    description="Comece pelos dados centrais da licitação, como normalmente aparecem no edital: identificação, valores essenciais, fonte oficial e objeto da contratação."
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InputField form={form} name="numeroLicitacao" label="Número da licitação" description={getFieldGuide("identificacao", "numeroLicitacao")?.description} placeholder={getFieldGuide("identificacao", "numeroLicitacao")?.placeholder} />
                      <InputField form={form} name="ano" label="Ano" description={getFieldGuide("identificacao", "ano")?.description} placeholder={getFieldGuide("identificacao", "ano")?.placeholder} type="number" />
                      <InputField form={form} name="modalidade" label="Modalidade" description={getFieldGuide("identificacao", "modalidade")?.description} placeholder={getFieldGuide("identificacao", "modalidade")?.placeholder} />
                      <SelectField form={form} name="situacao" label="Situação" description={getFieldGuide("identificacao", "situacao")?.description} options={SITUACAO_OPTIONS} />
                      <SelectField form={form} name="srp" label="SRP" description={getFieldGuide("identificacao", "srp")?.description} options={BOOLEAN_OPTIONS} />
                      <InputField form={form} name="valorTotalEstimado" label="Valor total estimado" description={getFieldGuide("identificacao", "valorTotalEstimado")?.description} placeholder={getFieldGuide("identificacao", "valorTotalEstimado")?.placeholder} type="number" step="0.01" />
                      <InputField form={form} name="dataPublicacao" label="Data de publicação" description={getFieldGuide("identificacao", "dataPublicacao")?.description} type="date" />
                      <InputField form={form} name="linkProcesso" label="Link do processo" description={getFieldGuide("identificacao", "linkProcesso")?.description} placeholder={getFieldGuide("identificacao", "linkProcesso")?.placeholder} />
                      <TextareaField form={form} name="objeto" label="Objeto" description={getFieldGuide("identificacao", "objeto")?.description} placeholder={getFieldGuide("identificacao", "objeto")?.placeholder} className="md:col-span-2 xl:col-span-4" rows={5} />
                    </div>

                  </StepSection>

                  <StepSection
                    title="Cronograma"
                    description="Na sequência, registre os prazos que ordenam a disputa: acolhimento, sessão pública, esclarecimentos, impugnações e horários críticos do processo."
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InputField form={form} name="edital.cronograma.acolhimentoInicio" label="Início do acolhimento" description={getFieldGuide("edital-geral", "cronograma.acolhimentoInicio")?.description} type="date" />
                      <InputField form={form} name="edital.cronograma.acolhimentoFim" label="Fim do acolhimento" description={getFieldGuide("edital-geral", "cronograma.acolhimentoFim")?.description} type="date" />
                      <InputField form={form} name="edital.cronograma.horaLimite" label="Hora limite" description={getFieldGuide("edital-geral", "cronograma.horaLimite")?.description} type="time" />
                      <InputField form={form} name="edital.cronograma.horaSessaoPublica" label="Hora da sessão pública" description={getFieldGuide("edital-geral", "cronograma.horaSessaoPublica")?.description} type="time" />
                      <InputField form={form} name="edital.cronograma.sessaoPublica" label="Data da sessão pública" description={getFieldGuide("edital-geral", "cronograma.sessaoPublica")?.description} type="date" />
                      <InputField form={form} name="edital.cronograma.esclarecimentosAte" label="Esclarecimentos até" description={getFieldGuide("edital-geral", "cronograma.esclarecimentosAte")?.description} type="date" />
                      <InputField form={form} name="edital.cronograma.impugnacaoAte" label="Impugnação até" description={getFieldGuide("edital-geral", "cronograma.impugnacaoAte")?.description} type="date" />
                    </div>
                  </StepSection>

                </>
              )}

              {currentStep.id === "certame" && (
                <>
                  <StepSection
                    title="Regras do certame"
                    description="Depois da abertura do edital, concentre aqui a forma de disputa, o critério de julgamento, restrições de participação, vigências e regras de adesão."
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InputField form={form} name="edital.certame.modoDisputa" label="Modo de disputa" description={getFieldGuide("certame", "modoDisputa")?.description} placeholder={getFieldGuide("certame", "modoDisputa")?.placeholder} />
                      <InputField form={form} name="edital.certame.criterioJulgamento" label="Critério de julgamento" description={getFieldGuide("certame", "criterioJulgamento")?.description} placeholder={getFieldGuide("certame", "criterioJulgamento")?.placeholder} />
                      <SelectField form={form} name="edital.certame.tipoLance" label="Tipo de lance" description={getFieldGuide("certame", "tipoLance")?.description} options={TIPO_LANCE_OPTIONS} />
                      <InputField form={form} name="edital.certame.intervaloLances" label="Intervalo entre lances" description={getFieldGuide("certame", "intervaloLances")?.description} placeholder={getFieldGuide("certame", "intervaloLances")?.placeholder} />
                      <InputField form={form} name="edital.certame.duracaoSessaoMinutos" label="Duração da sessão (min)" description={getFieldGuide("certame", "duracaoSessaoMinutos")?.description} placeholder={getFieldGuide("certame", "duracaoSessaoMinutos")?.placeholder} type="number" />
                      <InputField form={form} name="edital.certame.regionalidade" label="Regionalidade" description={getFieldGuide("certame", "regionalidade")?.description} placeholder={getFieldGuide("certame", "regionalidade")?.placeholder} />
                      <InputField form={form} name="edital.certame.percentualAdesao" label="Percentual de adesão" description={getFieldGuide("certame", "percentualAdesao")?.description} placeholder={getFieldGuide("certame", "percentualAdesao")?.placeholder} type="number" step="0.01" />
                      <SelectField form={form} name="edital.certame.difal" label="DIFAL" description={getFieldGuide("certame", "difal")?.description} options={BOOLEAN_OPTIONS} />
                      <SelectField form={form} name="edital.certame.exclusivoMeEpp" label="Exclusivo ME/EPP" description={getFieldGuide("certame", "exclusivoMeEpp")?.description} options={BOOLEAN_OPTIONS} />
                      <SelectField form={form} name="edital.certame.permiteConsorcio" label="Permite consórcio" description={getFieldGuide("certame", "permiteConsorcio")?.description} options={BOOLEAN_OPTIONS} />
                      <SelectField form={form} name="edital.certame.exigeVisitaTecnica" label="Exige visita técnica" description={getFieldGuide("certame", "exigeVisitaTecnica")?.description} options={BOOLEAN_OPTIONS} />
                      <SelectField form={form} name="edital.certame.permiteAdesao" label="Permite adesão" description={getFieldGuide("certame", "permiteAdesao")?.description} options={BOOLEAN_OPTIONS} />
                      <InputField form={form} name="edital.certame.vigenciaAtaMeses" label="Vigência da ata (meses)" description={getFieldGuide("certame", "vigenciaAtaMeses")?.description} placeholder={getFieldGuide("certame", "vigenciaAtaMeses")?.placeholder} type="number" />
                      <InputField form={form} name="edital.certame.vigenciaContratoDias" label="Vigência do contrato (dias)" description={getFieldGuide("certame", "vigenciaContratoDias")?.description} placeholder={getFieldGuide("certame", "vigenciaContratoDias")?.placeholder} type="number" />
                    </div>
                  </StepSection>

                  <StepSection
                    title="Execução contratual"
                    description="Na etapa seguinte do edital, registre as condições práticas da contratação: entrega, aceite, pagamento, validade da proposta e garantia."
                  >
                    <div className="grid gap-6 xl:grid-cols-2">
                      <fieldset className="space-y-4 rounded-lg bg-surface-container-lowest p-4">
                        <legend className="px-1 text-sm font-semibold">Entrega</legend>
                        <div className="grid gap-4 md:grid-cols-2">
                          <InputField form={form} name="edital.execucao.entrega.prazoEmDias" label="Prazo de entrega (dias)" description={getFieldGuide("execucao", "entrega.prazoEmDias")?.description} placeholder={getFieldGuide("execucao", "entrega.prazoEmDias")?.placeholder} type="number" />
                          <InputField form={form} name="edital.execucao.entrega.localEntrega" label="Local de entrega" description={getFieldGuide("execucao", "entrega.localEntrega")?.description} placeholder={getFieldGuide("execucao", "entrega.localEntrega")?.placeholder} />
                          <SelectField form={form} name="edital.execucao.entrega.tipoEntrega" label="Tipo de entrega" description={getFieldGuide("execucao", "entrega.tipoEntrega")?.description} options={TIPO_ENTREGA_OPTIONS} />
                          <SelectField form={form} name="edital.execucao.entrega.responsavelInstalacao" label="Responsável pela instalação" description={getFieldGuide("execucao", "entrega.responsavelInstalacao")?.description} options={RESPONSAVEL_INSTALACAO_OPTIONS} />
                        </div>
                      </fieldset>

                      <fieldset className="space-y-4 rounded-lg bg-surface-container-lowest p-4">
                        <legend className="px-1 text-sm font-semibold">Pagamento e aceite</legend>
                        <div className="grid gap-4 md:grid-cols-2">
                          <InputField form={form} name="edital.execucao.pagamento.prazoEmDias" label="Prazo de pagamento (dias)" description={getFieldGuide("execucao", "pagamento.prazoEmDias")?.description} placeholder={getFieldGuide("execucao", "pagamento.prazoEmDias")?.placeholder} type="number" />
                          <InputField form={form} name="edital.execucao.aceite.prazoEmDias" label="Prazo de aceite (dias)" description={getFieldGuide("execucao", "aceite.prazoEmDias")?.description} placeholder={getFieldGuide("execucao", "aceite.prazoEmDias")?.placeholder} type="number" />
                        </div>
                      </fieldset>

                      <fieldset className="space-y-4 rounded-lg bg-surface-container-lowest p-4 xl:col-span-2">
                        <legend className="px-1 text-sm font-semibold">Validade da proposta e garantia</legend>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <InputField form={form} name="edital.execucao.validadeProposta" label="Validade da proposta (dias)" description={getFieldGuide("execucao", "validadeProposta")?.description} placeholder={getFieldGuide("execucao", "validadeProposta")?.placeholder} type="number" />
                          <SelectField form={form} name="edital.execucao.garantia.tipo" label="Tipo de garantia" description={getFieldGuide("execucao", "garantia.tipo")?.description} options={GARANTIA_TIPO_OPTIONS} />
                          <InputField form={form} name="edital.execucao.garantia.meses" label="Meses de garantia" description={getFieldGuide("execucao", "garantia.meses")?.description} placeholder={getFieldGuide("execucao", "garantia.meses")?.placeholder} type="number" />
                          <InputField form={form} name="edital.execucao.garantia.tempoAtendimentoHoras" label="Atendimento (horas)" description={getFieldGuide("execucao", "garantia.tempoAtendimentoHoras")?.description} placeholder={getFieldGuide("execucao", "garantia.tempoAtendimentoHoras")?.placeholder} type="number" />
                        </div>
                      </fieldset>
                    </div>
                  </StepSection>

                  <StepSection
                    title="Habilitação"
                    description="Finalize esta etapa com o conjunto de documentos exigidos do fornecedor para comprovação jurídica, fiscal, técnica e econômico-financeira."
                  >
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => habilitacao.append(createEmptyDocumentoHabilitacaoFormValues())}
                        >
                          <Plus className="mr-2 size-4" />
                          Adicionar documento
                        </Button>
                      </div>

                      {habilitacao.fields.length === 0 ? (
                        <EmptyState message="Nenhum documento de habilitação cadastrado." />
                      ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                          <div className="hidden grid-cols-[56px_minmax(0,1.7fr)_minmax(0,1fr)_180px_44px] items-center gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 lg:grid">
                            <CompactColumnHeader
                              label="Doc"
                              description="Número sequencial apenas para organização visual da lista."
                            />
                            <CompactColumnHeader
                              label="Tipo"
                              description={getFieldGuide("participantes-habilitacao", "habilitacao.tipo")?.description}
                            />
                            <CompactColumnHeader
                              label="Categoria"
                              description={getFieldGuide("participantes-habilitacao", "habilitacao.categoria")?.description}
                            />
                            <CompactColumnHeader
                              label="Obrigatório"
                              description={getFieldGuide("participantes-habilitacao", "habilitacao.obrigatorio")?.description}
                            />
                            <span className="sr-only">Ações</span>
                          </div>

                          {habilitacao.fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="grid gap-3 border-t border-slate-200/80 px-4 py-3 first:border-t-0 lg:grid-cols-[56px_minmax(0,1.7fr)_minmax(0,1fr)_180px_44px] lg:items-center"
                            >
                              <div className="flex items-center justify-between gap-3 lg:block">
                                <div className="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                  {index + 1}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => habilitacao.remove(index)}
                                  className="h-8 px-2 text-slate-600 lg:hidden"
                                >
                                  <Trash2 className="mr-1.5 size-4" />
                                  Remover
                                </Button>
                              </div>

                              <div className="space-y-1 lg:space-y-0">
                                <Label className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:sr-only">
                                  Tipo
                                </Label>
                                <Input
                                  {...form.register(`edital.habilitacao.${index}.tipo` as FormPath)}
                                  placeholder={getFieldGuide("participantes-habilitacao", "habilitacao.tipo")?.placeholder}
                                  className="h-10"
                                />
                              </div>

                              <div className="space-y-1 lg:space-y-0">
                                <Label className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:sr-only">
                                  Categoria
                                </Label>
                                <Input
                                  {...form.register(`edital.habilitacao.${index}.categoria` as FormPath)}
                                  placeholder={getFieldGuide("participantes-habilitacao", "habilitacao.categoria")?.placeholder}
                                  className="h-10"
                                />
                              </div>

                              <div className="space-y-1 lg:space-y-0">
                                <Label className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:sr-only">
                                  Obrigatório
                                </Label>
                                <Controller
                                  control={form.control}
                                  name={`edital.habilitacao.${index}.obrigatorio` as FormPath}
                                  render={({ field }) => (
                                    <Select
                                      value={(field.value as string) || "__empty__"}
                                      onValueChange={val => field.onChange(val === "__empty__" ? "" : val)}
                                    >
                                      <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {BOOLEAN_OPTIONS.map(option => (
                                          <SelectItem key={option.value || "__empty__"} value={option.value || "__empty__"}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>

                              <div className="hidden justify-end lg:flex">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => habilitacao.remove(index)}
                                  className="size-9 text-slate-500 hover:text-destructive"
                                  aria-label={`Remover documento ${index + 1}`}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </StepSection>
                </>
              )}

              {currentStep.id === "participantes-habilitacao" && (
                <>
                  <StepSection
                    title="Órgão gerenciador"
                    description="Comece a organização institucional pelo órgão que conduz o processo e registre seus dados principais nesta etapa."
                  >
                    <OrgaoPublicoFields
                      form={form}
                      prefix="orgaoGerenciador"
                      metaStepId="orgao-gerenciador"
                      knownOrgaos={knownOrgaos}
                      isLoadingKnownOrgaos={isLoadingKnownOrgaos}
                    />
                  </StepSection>

                  <StepSection
                    title="Órgãos participantes"
                    description="Depois do órgão gerenciador, registre os órgãos participantes da contratação compartilhada."
                  >
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => orgaosParticipantes.append(createEmptyOrgaoPublicoFormValues())}
                        >
                          <Plus className="mr-2 size-4" />
                          Adicionar órgão participante
                        </Button>
                      </div>

                      {orgaosParticipantes.fields.length === 0 ? (
                        <EmptyState message="Nenhum órgão participante cadastrado." />
                      ) : (
                        orgaosParticipantes.fields.map((field, index) => (
                          <OrgaoParticipanteCard
                            key={field.id}
                            form={form}
                            index={index}
                            metaStepId="participantes-habilitacao"
                            knownOrgaos={knownOrgaos}
                            isLoadingKnownOrgaos={isLoadingKnownOrgaos}
                            onRemove={() => orgaosParticipantes.remove(index)}
                          />
                        ))
                      )}
                    </div>
                  </StepSection>
                </>
              )}

              {currentStep.id === "informacoes-complementares" && (
                <StepSection
                  title="Informações complementares"
                  description="Finalize o contexto textual do edital com fundamentos legais e observações adicionais que ajudam na interpretação do processo, mas não pertencem ao núcleo operacional da disputa."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextareaField
                      form={form}
                      name="edital.amparoLegal"
                      label="Amparo legal"
                      description={getFieldGuide("informacoes-complementares", "edital.amparoLegal")?.description}
                      placeholder={getFieldGuide("informacoes-complementares", "edital.amparoLegal")?.placeholder}
                      rows={5}
                    />
                    <TextareaField
                      form={form}
                      name="edital.informacaoComplementar"
                      label="Informação complementar"
                      description={getFieldGuide("informacoes-complementares", "edital.informacaoComplementar")?.description}
                      placeholder={getFieldGuide("informacoes-complementares", "edital.informacaoComplementar")?.placeholder}
                      rows={5}
                    />
                  </div>
                </StepSection>
              )}

              {currentStep.id === "itens" && (
                <StepSection
                  title="Itens do edital"
                  description="Cadastre só o essencial de cada item do edital para seguir com a oportunidade: identificação, tipo, quantidades, valores e descrição."
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          Total atual de itens: <span className="font-semibold text-foreground">{itens.fields.length}</span>
                        </span>
                        {itens.fields.length > 0 ? (
                          <>
                            <span>
                              Ativos: <span className="font-semibold text-foreground">{activeItemsCount}</span>
                            </span>
                            <span>
                              Total ativo: <span className="font-semibold text-foreground">{formatNumberToCurrency(activeItemsTotal)}</span>
                            </span>
                          </>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => itens.append(createEmptyItemLicitadoFormValues())}
                      >
                        <Plus className="mr-2 size-4" />
                        Adicionar item
                      </Button>
                    </div>

                    {itens.fields.length === 0 ? (
                      <EmptyState message="Nenhum item licitado cadastrado." />
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                        <Table className="min-w-[1180px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[88px]">Ativo</TableHead>
                              <TableHead className="w-[88px]">Nº</TableHead>
                              <TableHead className="w-[120px]">Tipo</TableHead>
                              <TableHead className="w-[110px]">Lote</TableHead>
                              <TableHead className="w-[140px]">Unidade</TableHead>
                              <TableHead className="w-[120px]">Qtd.</TableHead>
                              <TableHead className="w-[150px]">Vlr. unit.</TableHead>
                              <TableHead className="w-[150px]">Vlr. total</TableHead>
                              <TableHead className="min-w-[340px]">Descrição</TableHead>
                              <TableHead className="w-[72px] text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itens.fields.map((field, index) => {
                              const item = resolvedItens[index]
                              const isActive = item?.ativo ?? true

                              return (
                                <TableRow key={field.id} className={cn(!isActive && "bg-slate-50/80 opacity-75")}>
                                  <TableCell>
                                    <Switch
                                      checked={isActive}
                                      onCheckedChange={checked => setItemActive(field.itemId, checked)}
                                      aria-label={`Marcar item ${index + 1} como ativo`}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.numero` as FormPath)}
                                      type="number"
                                      placeholder={getFieldGuide("itens", "item.numero")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Controller
                                      control={form.control}
                                      name={`edital.itens.${index}.tipo` as FormPath}
                                      render={({ field: selectField }) => (
                                        <Select
                                          value={(selectField.value as string) || "__empty__"}
                                          onValueChange={value => selectField.onChange(value === "__empty__" ? "" : value)}
                                        >
                                          <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder="Tipo" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {TIPO_ITEM_OPTIONS.map(option => (
                                              <SelectItem key={option.value || "__empty__"} value={option.value || "__empty__"}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.lote` as FormPath)}
                                      placeholder={getFieldGuide("itens", "item.lote")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.unidadeMedida` as FormPath)}
                                      placeholder={getFieldGuide("itens", "item.unidadeMedida")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.quantidade` as FormPath)}
                                      type="number"
                                      step="0.01"
                                      placeholder={getFieldGuide("itens", "item.quantidade")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.valorUnitarioEstimado` as FormPath)}
                                      type="number"
                                      step="0.01"
                                      placeholder={getFieldGuide("itens", "item.valorUnitarioEstimado")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.valorTotal` as FormPath)}
                                      type="number"
                                      step="0.01"
                                      placeholder={getFieldGuide("itens", "item.valorTotal")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      {...form.register(`edital.itens.${index}.descricao` as FormPath)}
                                      placeholder={getFieldGuide("itens", "item.descricao")?.placeholder}
                                      className="h-9"
                                    />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => itens.remove(index)}
                                      className="size-8 text-slate-500 hover:text-destructive"
                                      aria-label={`Remover item ${index + 1}`}
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </StepSection>
              )}
            </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => goToStep(currentStepIndex - 1)} disabled={isFirstStep}>
                  <ArrowLeft className="mr-2 size-4" />
                  Voltar
                </Button>
                {isLastStep ? (
                  <Button type="submit" disabled={isSubmitting || isCompleted}>
                    {isSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                    {isCompleted ? "Cadastro concluído" : "Concluir cadastro"}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => goToStep(currentStepIndex + 1)}>
                    Próxima etapa
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}
              </div>
              {submitError ? (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Não foi possível concluir o cadastro</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </form>
      </div>
    </TooltipProvider>
  )
}

function StepSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4 rounded-lg bg-white p-4 md:p-5">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-primary">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function OrgaoParticipanteCard({
  form,
  index,
  metaStepId,
  knownOrgaos,
  isLoadingKnownOrgaos = false,
  onRemove,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  index: number
  metaStepId: "participantes-habilitacao"
  knownOrgaos: KnownOrgaoOption[]
  isLoadingKnownOrgaos?: boolean
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-medium">Órgão participante {index + 1}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="mr-2 size-4" />
          Remover
        </Button>
      </div>

      <OrgaoPublicoFields
        form={form}
        prefix={`edital.orgaosParticipantes.${index}` as FormPath}
        metaStepId={metaStepId}
        knownOrgaos={knownOrgaos}
        isLoadingKnownOrgaos={isLoadingKnownOrgaos}
      />
    </div>
  )
}

function OrgaoPublicoFields({
  form,
  prefix,
  metaStepId,
  knownOrgaos,
  isLoadingKnownOrgaos = false,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  prefix: FormPath
  metaStepId: "orgao-gerenciador" | "participantes-habilitacao"
  knownOrgaos: KnownOrgaoOption[]
  isLoadingKnownOrgaos?: boolean
}) {
  const [selectedKnownOrgaoId, setSelectedKnownOrgaoId] = React.useState("__manual__")

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FieldShell
        label="Usar órgão já cadastrado"
        description="Selecione um órgão já utilizado em outra licitação para preencher rapidamente os campos abaixo."
        className="md:col-span-2 xl:col-span-4"
      >
        <Select
          value={selectedKnownOrgaoId}
          onValueChange={value => {
            setSelectedKnownOrgaoId(value)

            if (value === "__manual__") return

            const selectedOrgao = knownOrgaos.find(orgao => orgao.id === value)
            if (!selectedOrgao) return

            applyKnownOrgaoSelection({
              form,
              prefix,
              orgao: selectedOrgao,
            })
          }}
          disabled={isLoadingKnownOrgaos || knownOrgaos.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isLoadingKnownOrgaos
                  ? "Carregando órgãos cadastrados..."
                  : knownOrgaos.length === 0
                    ? "Nenhum órgão cadastrado disponível"
                    : "Selecione um órgão para preencher os dados"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__manual__">Preencher manualmente</SelectItem>
            {knownOrgaos.map(orgao => (
              <SelectItem key={orgao.id} value={orgao.id}>
                {formatKnownOrgaoOptionLabel(orgao)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldShell>
      <InputField form={form} name={`${prefix}.nome` as FormPath} label="Nome" description={getFieldGuide(metaStepId, "orgao.nome")?.description} placeholder={getFieldGuide(metaStepId, "orgao.nome")?.placeholder} className="md:col-span-2" />
      <InputField form={form} name={`${prefix}.cnpj` as FormPath} label="CNPJ" description={getFieldGuide(metaStepId, "orgao.cnpj")?.description} placeholder={getFieldGuide(metaStepId, "orgao.cnpj")?.placeholder} />
      <InputField form={form} name={`${prefix}.codigoUnidade` as FormPath} label="Código da unidade" description={getFieldGuide(metaStepId, "orgao.codigoUnidade")?.description} placeholder={getFieldGuide(metaStepId, "orgao.codigoUnidade")?.placeholder} />
      <InputField form={form} name={`${prefix}.nomeUnidade` as FormPath} label="Nome da unidade" description={getFieldGuide(metaStepId, "orgao.nomeUnidade")?.description} placeholder={getFieldGuide(metaStepId, "orgao.nomeUnidade")?.placeholder} className="md:col-span-2" />
      <InputField form={form} name={`${prefix}.municipio` as FormPath} label="Município" description={getFieldGuide(metaStepId, "orgao.municipio")?.description} placeholder={getFieldGuide(metaStepId, "orgao.municipio")?.placeholder} />
      <InputField form={form} name={`${prefix}.uf` as FormPath} label="UF" description={getFieldGuide(metaStepId, "orgao.uf")?.description} placeholder={getFieldGuide(metaStepId, "orgao.uf")?.placeholder} />
      <SelectField form={form} name={`${prefix}.esfera` as FormPath} label="Esfera" description={getFieldGuide(metaStepId, "orgao.esfera")?.description} options={ESFERA_OPTIONS} />
      <SelectField form={form} name={`${prefix}.poder` as FormPath} label="Poder" description={getFieldGuide(metaStepId, "orgao.poder")?.description} options={PODER_OPTIONS} />
    </div>
  )
}

function InputField({
  form,
  name,
  label,
  description,
  placeholder,
  type = "text",
  className,
  step,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  name: FormPath
  label: string
  description?: string
  placeholder?: string
  type?: React.ComponentProps<typeof Input>["type"]
  className?: string
  step?: string
}) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <Input {...form.register(name)} type={type} step={step} placeholder={placeholder} />
    </FieldShell>
  )
}

function TextareaField({
  form,
  name,
  label,
  description,
  placeholder,
  className,
  rows = 4,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  name: FormPath
  label: string
  description?: string
  placeholder?: string
  className?: string
  rows?: number
}) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <Textarea {...form.register(name)} rows={rows} placeholder={placeholder} />
    </FieldShell>
  )
}

function SelectField({
  form,
  name,
  label,
  description,
  placeholder,
  options,
  className,
}: {
  form: UseFormReturn<NovaLicitacaoFormValues>
  name: FormPath
  label: string
  description?: string
  placeholder?: string
  options: SelectOption[]
  className?: string
}) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select
            value={(field.value as string) || "__empty__"}
            onValueChange={val => field.onChange(val === "__empty__" ? "" : val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder ?? "Selecione"} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value || "__empty__"} value={option.value || "__empty__"}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  )
}

function FieldShell({
  label,
  description,
  className,
  children,
}: {
  label: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <Label className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</Label>
        {description ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-primary"
                aria-label={`Mais informações sobre ${label}`}
              >
                <CircleHelp className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="max-w-72 bg-primary px-3 py-2 text-[11px] leading-relaxed text-primary-foreground">
              {description}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function CompactColumnHeader({
  label,
  description,
}: {
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      {description ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-primary"
              aria-label={`Mais informações sobre ${label}`}
            >
              <CircleHelp className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="max-w-72 bg-primary px-3 py-2 text-[11px] leading-relaxed text-primary-foreground">
            {description}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg bg-surface-container-lowest text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function SimpleStepper({
  steps,
  currentStepIndex,
  onStepClick,
  className,
}: {
  steps: typeof FORM_STEPS
  currentStepIndex: number
  onStepClick: (index: number) => void
  className?: string
}) {
  return (
    <div className={cn("rounded-lg bg-white px-5 py-6 shadow-[0_10px_30px_rgba(4,22,39,0.04)]", className)}>
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex

          return (
            <React.Fragment key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onStepClick(index)}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
                  >
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-[0.7rem] border transition-colors",
                        isActive
                          ? "border-secondary bg-secondary text-white"
                          : isCompleted
                            ? "border-secondary/20 bg-secondary/10 text-secondary"
                            : "border-border bg-surface-container-low text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-current" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className={cn("text-sm font-medium leading-tight", isActive ? "text-primary" : "text-muted-foreground")}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isActive ? "Em andamento" : index < currentStepIndex ? "Concluída" : "Pendente"}
                      </p>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10} className="max-w-72 bg-primary px-3 py-2 text-[11px] leading-relaxed text-primary-foreground">
                  {step.description}
                </TooltipContent>
              </Tooltip>

              {index < steps.length - 1 && (
                <div className="mt-3 h-px flex-1 bg-slate-200/80" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
