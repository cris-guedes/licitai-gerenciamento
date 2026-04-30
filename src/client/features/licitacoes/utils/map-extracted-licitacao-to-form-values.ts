import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import {
  createItemReferenceId,
  createEmptyDocumentoHabilitacaoFormValues,
  createEmptyItemLicitadoFormValues,
  createEmptyOrgaoPublicoFormValues,
  createNovaLicitacaoDefaultValues,
  type NovaLicitacaoFormValues,
  type OrgaoPublicoFormValues,
} from "../schemas/nova-licitacao.schema"

type ExtractedLicitacao = ExtractEditalDataResponse["licitacao"]

function toInputValue(value: string | number | null | undefined) {
  return value == null ? "" : String(value)
}

function toBooleanSelect(value: boolean | null | undefined) {
  if (value == null) return ""
  return value ? "true" : "false"
}

function mapItensSolicitados(
  itensSolicitados: Array<{ itemNumero: number; quantidade: number }> | null | undefined,
  itemIdByNumero: Map<string, string>,
) {
  if (!Array.isArray(itensSolicitados)) return []

  return itensSolicitados.map(item => ({
    itemId: itemIdByNumero.get(toInputValue(item.itemNumero)) ?? "",
    quantidade: toInputValue(item.quantidade),
  }))
}

function mapOrgao(
  orgao: ExtractedLicitacao["orgaoGerenciador"],
  itemIdByNumero: Map<string, string>,
): OrgaoPublicoFormValues {
  if (!orgao) return createEmptyOrgaoPublicoFormValues()

  return {
    cnpj: toInputValue(orgao.cnpj),
    nome: toInputValue(orgao.nome),
    codigoUnidade: toInputValue(orgao.codigoUnidade),
    nomeUnidade: toInputValue(orgao.nomeUnidade),
    municipio: toInputValue(orgao.municipio),
    uf: toInputValue(orgao.uf),
    esfera: orgao.esfera ?? "",
    poder: orgao.poder ?? "",
    itensSolicitados: mapItensSolicitados(orgao.itensSolicitados, itemIdByNumero),
  }
}

export function mapExtractedLicitacaoToFormValues(
  licitacao: ExtractedLicitacao,
): NovaLicitacaoFormValues {
  const defaults = createNovaLicitacaoDefaultValues()
  const edital = licitacao.edital
  const mappedItens = (edital?.itens ?? []).map((item, index) => {
    const numero = toInputValue(item.numero) || String(index + 1)
    return {
      ...createEmptyItemLicitadoFormValues(),
      itemId: createItemReferenceId(numero),
      numero: toInputValue(item.numero),
      descricao: toInputValue(item.descricao),
      tipo: item.tipo ?? "",
      lote: toInputValue(item.lote),
      quantidade: toInputValue(item.quantidade),
      unidadeMedida: toInputValue(item.unidadeMedida),
      valorUnitarioEstimado: toInputValue(item.valorUnitarioEstimado),
      valorTotal: toInputValue(item.valorTotal),
      codigoNcmNbs: toInputValue(item.codigoNcmNbs),
      descricaoNcmNbs: toInputValue(item.descricaoNcmNbs),
      codigoCatmatCatser: toInputValue(item.codigoCatmatCatser),
      criterioJulgamento: toInputValue(item.criterioJulgamento),
      beneficioTributario: toInputValue(item.beneficioTributario),
      observacao: toInputValue(item.observacao),
    }
  })
  const itemIdByNumero = new Map(mappedItens.map(item => [item.numero, item.itemId]))

  return {
    ...defaults,
    numeroLicitacao: toInputValue(licitacao.numeroLicitacao),
    ano: toInputValue(licitacao.ano),
    processo: toInputValue(licitacao.processo),
    modalidade: toInputValue(licitacao.modalidade),
    objeto: toInputValue(licitacao.objeto),
    orgaoGerenciador: mapOrgao(licitacao.orgaoGerenciador, itemIdByNumero),
    valorTotalEstimado: toInputValue(licitacao.valorTotalEstimado),
    valorTotalHomologado: toInputValue(licitacao.valorTotalHomologado),
    srp: toBooleanSelect(licitacao.srp),
    situacao: licitacao.situacao ?? "",
    dataPublicacao: toInputValue(licitacao.dataPublicacao),
    dataUltimaAtualizacao: toInputValue(licitacao.dataUltimaAtualizacao),
    linkProcesso: toInputValue(licitacao.linkProcesso),
    identificadorExterno: toInputValue(licitacao.identificadorExterno),
    edital: {
      ...defaults.edital,
      amparoLegal: toInputValue(edital?.amparoLegal),
      orgaosParticipantes: (edital?.orgaosParticipantes ?? []).map(orgao => mapOrgao(orgao, itemIdByNumero)),
      cronograma: {
        ...defaults.edital.cronograma,
        acolhimentoInicio: toInputValue(edital?.cronograma?.acolhimentoInicio),
        acolhimentoFim: toInputValue(edital?.cronograma?.acolhimentoFim),
        horaLimite: toInputValue(edital?.cronograma?.horaLimite),
        sessaoPublica: toInputValue(edital?.cronograma?.sessaoPublica),
        horaSessaoPublica: toInputValue(edital?.cronograma?.horaSessaoPublica),
        esclarecimentosAte: toInputValue(edital?.cronograma?.esclarecimentosAte),
        impugnacaoAte: toInputValue(edital?.cronograma?.impugnacaoAte),
      },
      certame: {
        ...defaults.edital.certame,
        modoDisputa: toInputValue(edital?.certame?.modoDisputa),
        criterioJulgamento: toInputValue(edital?.certame?.criterioJulgamento),
        tipoLance: edital?.certame?.tipoLance ?? "",
        intervaloLances: toInputValue(edital?.certame?.intervaloLances),
        duracaoSessaoMinutos: toInputValue(edital?.certame?.duracaoSessaoMinutos),
        exclusivoMeEpp: toBooleanSelect(edital?.certame?.exclusivoMeEpp),
        permiteConsorcio: toBooleanSelect(edital?.certame?.permiteConsorcio),
        exigeVisitaTecnica: toBooleanSelect(edital?.certame?.exigeVisitaTecnica),
        regionalidade: toInputValue(edital?.certame?.regionalidade),
        permiteAdesao: toBooleanSelect(edital?.certame?.permiteAdesao),
        percentualAdesao: toInputValue(edital?.certame?.percentualAdesao),
        vigenciaAtaMeses: toInputValue(edital?.certame?.vigenciaAtaMeses),
        vigenciaContratoDias: toInputValue(edital?.certame?.vigenciaContratoDias),
        difal: toBooleanSelect(edital?.certame?.difal),
      },
      itens: mappedItens,
      execucao: {
        ...defaults.edital.execucao,
        entrega: {
          ...defaults.edital.execucao.entrega,
          prazoEmDias: toInputValue(edital?.execucao?.entrega?.prazoEmDias),
          localEntrega: toInputValue(edital?.execucao?.entrega?.localEntrega),
          tipoEntrega: edital?.execucao?.entrega?.tipoEntrega ?? "",
          responsavelInstalacao: edital?.execucao?.entrega?.responsavelInstalacao ?? "",
        },
        pagamento: {
          ...defaults.edital.execucao.pagamento,
          prazoEmDias: toInputValue(edital?.execucao?.pagamento?.prazoEmDias),
        },
        aceite: {
          ...defaults.edital.execucao.aceite,
          prazoEmDias: toInputValue(edital?.execucao?.aceite?.prazoEmDias),
        },
        validadeProposta: toInputValue(edital?.execucao?.validadeProposta),
        garantia: {
          ...defaults.edital.execucao.garantia,
          tipo: edital?.execucao?.garantia?.tipo ?? "",
          meses: toInputValue(edital?.execucao?.garantia?.meses),
          tempoAtendimentoHoras: toInputValue(edital?.execucao?.garantia?.tempoAtendimentoHoras),
        },
      },
      habilitacao: (edital?.habilitacao ?? []).map(documento => ({
        ...createEmptyDocumentoHabilitacaoFormValues(),
        tipo: toInputValue(documento.tipo),
        categoria: toInputValue(documento.categoria),
        obrigatorio: toBooleanSelect(documento.obrigatorio),
      })),
      informacaoComplementar: toInputValue(edital?.informacaoComplementar),
    },
  }
}
