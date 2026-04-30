import { z } from "zod"

export type SelectOption = {
  value: string
  label: string
}

export const BOOLEAN_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
]

export const ESFERA_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informada" },
  { value: "federal", label: "Federal" },
  { value: "estadual", label: "Estadual" },
  { value: "municipal", label: "Municipal" },
]

export const PODER_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "executivo", label: "Executivo" },
  { value: "legislativo", label: "Legislativo" },
  { value: "judiciario", label: "Judiciário" },
]

export const SITUACAO_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informada" },
  { value: "publicada", label: "Publicada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "homologada", label: "Homologada" },
  { value: "suspensa", label: "Suspensa" },
  { value: "cancelada", label: "Cancelada" },
  { value: "revogada", label: "Revogada" },
]

export const TIPO_LANCE_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "unitario", label: "Unitário" },
  { value: "global", label: "Global" },
  { value: "percentual", label: "Percentual" },
]

export const TIPO_ITEM_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "material", label: "Material" },
  { value: "servico", label: "Serviço" },
]

export const TIPO_ENTREGA_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "centralizada", label: "Centralizada" },
  { value: "descentralizada", label: "Descentralizada" },
]

export const RESPONSAVEL_INSTALACAO_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "fornecedor", label: "Fornecedor" },
  { value: "comprador", label: "Comprador" },
]

export const GARANTIA_TIPO_OPTIONS: SelectOption[] = [
  { value: "", label: "Não informado" },
  { value: "onsite", label: "On-site" },
  { value: "balcao", label: "Balcão" },
  { value: "remota", label: "Remota" },
  { value: "sem_garantia", label: "Sem garantia" },
]

const selectField = (values: string[]) => z.union([z.literal(""), z.enum(values as [string, ...string[]])])

export function createItemReferenceId(seed?: string) {
  const normalizedSeed = seed?.trim()
  if (normalizedSeed) {
    return `item-${normalizedSeed}-${Math.random().toString(36).slice(2, 8)}`
  }

  return `item-${Math.random().toString(36).slice(2, 10)}`
}

const itemSolicitadoSchema = z.object({
  itemId: z.string(),
  quantidade: z.string(),
})

const orgaoPublicoSchema = z.object({
  cnpj: z.string(),
  nome: z.string(),
  codigoUnidade: z.string(),
  nomeUnidade: z.string(),
  municipio: z.string(),
  uf: z.string(),
  esfera: selectField(["federal", "estadual", "municipal"]),
  poder: selectField(["executivo", "legislativo", "judiciario"]),
  itensSolicitados: z.array(itemSolicitadoSchema),
})

const cronogramaSchema = z.object({
  acolhimentoInicio: z.string(),
  acolhimentoFim: z.string(),
  horaLimite: z.string(),
  sessaoPublica: z.string(),
  horaSessaoPublica: z.string(),
  esclarecimentosAte: z.string(),
  impugnacaoAte: z.string(),
})

const certameSchema = z.object({
  modoDisputa: z.string(),
  criterioJulgamento: z.string(),
  tipoLance: selectField(["unitario", "global", "percentual"]),
  intervaloLances: z.string(),
  duracaoSessaoMinutos: z.string(),
  exclusivoMeEpp: selectField(["true", "false"]),
  permiteConsorcio: selectField(["true", "false"]),
  exigeVisitaTecnica: selectField(["true", "false"]),
  regionalidade: z.string(),
  permiteAdesao: selectField(["true", "false"]),
  percentualAdesao: z.string(),
  vigenciaAtaMeses: z.string(),
  vigenciaContratoDias: z.string(),
  difal: selectField(["true", "false"]),
})

const prazoContratualSchema = z.object({
  prazoEmDias: z.string(),
})

const entregaContratualSchema = prazoContratualSchema.extend({
  localEntrega: z.string(),
  tipoEntrega: selectField(["centralizada", "descentralizada"]),
  responsavelInstalacao: selectField(["fornecedor", "comprador"]),
})

const garantiaContratualSchema = z.object({
  tipo: selectField(["onsite", "balcao", "remota", "sem_garantia"]),
  meses: z.string(),
  tempoAtendimentoHoras: z.string(),
})

const itemLicitadoSchema = z.object({
  itemId: z.string(),
  numero: z.string(),
  descricao: z.string(),
  tipo: selectField(["material", "servico"]),
  lote: z.string(),
  quantidade: z.string(),
  unidadeMedida: z.string(),
  valorUnitarioEstimado: z.string(),
  valorTotal: z.string(),
  codigoNcmNbs: z.string(),
  descricaoNcmNbs: z.string(),
  codigoCatmatCatser: z.string(),
  criterioJulgamento: z.string(),
  beneficioTributario: z.string(),
  observacao: z.string(),
})

const documentoHabilitacaoSchema = z.object({
  tipo: z.string(),
  categoria: z.string(),
  obrigatorio: selectField(["true", "false"]),
})

export const novaLicitacaoFormSchema = z.object({
  numeroLicitacao: z.string(),
  ano: z.string(),
  processo: z.string(),
  modalidade: z.string(),
  objeto: z.string(),
  orgaoGerenciador: orgaoPublicoSchema,
  valorTotalEstimado: z.string(),
  valorTotalHomologado: z.string(),
  srp: selectField(["true", "false"]),
  situacao: selectField([
    "publicada",
    "em_andamento",
    "homologada",
    "suspensa",
    "cancelada",
    "revogada",
  ]),
  dataPublicacao: z.string(),
  dataUltimaAtualizacao: z.string(),
  linkProcesso: z.string(),
  identificadorExterno: z.string(),
  edital: z.object({
    amparoLegal: z.string(),
    orgaosParticipantes: z.array(orgaoPublicoSchema),
    cronograma: cronogramaSchema,
    certame: certameSchema,
    itens: z.array(itemLicitadoSchema),
    execucao: z.object({
      entrega: entregaContratualSchema,
      pagamento: prazoContratualSchema,
      aceite: prazoContratualSchema,
      validadeProposta: z.string(),
      garantia: garantiaContratualSchema,
    }),
    habilitacao: z.array(documentoHabilitacaoSchema),
    informacaoComplementar: z.string(),
  }),
})

export type NovaLicitacaoFormValues = z.infer<typeof novaLicitacaoFormSchema>
export type OrgaoPublicoFormValues = NovaLicitacaoFormValues["orgaoGerenciador"]
export type ItemSolicitadoFormValues = OrgaoPublicoFormValues["itensSolicitados"][number]
export type DocumentoHabilitacaoFormValues = NovaLicitacaoFormValues["edital"]["habilitacao"][number]
export type ItemLicitadoFormValues = NovaLicitacaoFormValues["edital"]["itens"][number]

export function createEmptyItemSolicitadoFormValues(): ItemSolicitadoFormValues {
  return {
    itemId: "",
    quantidade: "",
  }
}

export function createEmptyOrgaoPublicoFormValues(): OrgaoPublicoFormValues {
  return {
    cnpj: "",
    nome: "",
    codigoUnidade: "",
    nomeUnidade: "",
    municipio: "",
    uf: "",
    esfera: "",
    poder: "",
    itensSolicitados: [],
  }
}

export function createEmptyDocumentoHabilitacaoFormValues(): DocumentoHabilitacaoFormValues {
  return {
    tipo: "",
    categoria: "",
    obrigatorio: "",
  }
}

export function createEmptyItemLicitadoFormValues(): ItemLicitadoFormValues {
  return {
    itemId: createItemReferenceId(),
    numero: "",
    descricao: "",
    tipo: "",
    lote: "",
    quantidade: "",
    unidadeMedida: "",
    valorUnitarioEstimado: "",
    valorTotal: "",
    codigoNcmNbs: "",
    descricaoNcmNbs: "",
    codigoCatmatCatser: "",
    criterioJulgamento: "",
    beneficioTributario: "",
    observacao: "",
  }
}

export function createNovaLicitacaoDefaultValues(): NovaLicitacaoFormValues {
  return {
    numeroLicitacao: "",
    ano: "",
    processo: "",
    modalidade: "",
    objeto: "",
    orgaoGerenciador: createEmptyOrgaoPublicoFormValues(),
    valorTotalEstimado: "",
    valorTotalHomologado: "",
    srp: "",
    situacao: "",
    dataPublicacao: "",
    dataUltimaAtualizacao: "",
    linkProcesso: "",
    identificadorExterno: "",
    edital: {
      amparoLegal: "",
      orgaosParticipantes: [],
      cronograma: {
        acolhimentoInicio: "",
        acolhimentoFim: "",
        horaLimite: "",
        sessaoPublica: "",
        horaSessaoPublica: "",
        esclarecimentosAte: "",
        impugnacaoAte: "",
      },
      certame: {
        modoDisputa: "",
        criterioJulgamento: "",
        tipoLance: "",
        intervaloLances: "",
        duracaoSessaoMinutos: "",
        exclusivoMeEpp: "",
        permiteConsorcio: "",
        exigeVisitaTecnica: "",
        regionalidade: "",
        permiteAdesao: "",
        percentualAdesao: "",
        vigenciaAtaMeses: "",
        vigenciaContratoDias: "",
        difal: "",
      },
      itens: [],
      execucao: {
        entrega: {
          prazoEmDias: "",
          localEntrega: "",
          tipoEntrega: "",
          responsavelInstalacao: "",
        },
        pagamento: {
          prazoEmDias: "",
        },
        aceite: {
          prazoEmDias: "",
        },
        validadeProposta: "",
        garantia: {
          tipo: "",
          meses: "",
          tempoAtendimentoHoras: "",
        },
      },
      habilitacao: [],
      informacaoComplementar: "",
    },
  }
}
