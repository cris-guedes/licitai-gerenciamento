/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContratoMapper } from "../../create-contrato/dtos/CreateContratoView";

export type GetContratoWorkspaceView = {
    data: any;
};

function toDecimalString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function toIsoString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

function normalizeCompanyItem(companyItem: any) {
    if (!companyItem) return null;

    return {
        id: companyItem.id,
        companyId: companyItem.companyId,
        codigo: companyItem.codigo,
        descricao: companyItem.descricao,
        marca: companyItem.marca,
        unidadeMedida: companyItem.unidadeMedida,
        imageUrl: companyItem.imageUrl,
        precoReferencia: companyItem.precoReferencia,
        ativo: companyItem.ativo,
        createdAt: toIsoString(companyItem.createdAt),
        updatedAt: toIsoString(companyItem.updatedAt),
    };
}

export function normalizeContratoItem(item: any) {
    const editalItem = item.oportunidadeItem?.editalItem;
    const pricing = item.oportunidadeItem?.pricing;
    const companyItem = item.oportunidadeItem?.companyItem;

    return {
        ...item,
        quantidadeContratada: toDecimalString(item.quantidadeContratada),
        valorUnitario: toDecimalString(item.valorUnitario),
        valorTotal: toDecimalString(item.valorTotal),
        quantidadeEmpenhada: toDecimalString(item.quantidadeEmpenhada) ?? "0",
        quantidadeEntregue: toDecimalString(item.quantidadeEntregue) ?? "0",
        quantidadePaga: toDecimalString(item.quantidadePaga) ?? "0",
        itemNumero: editalItem?.numeroItem ?? null,
        descricao: editalItem?.descricao ?? "Item sem descricao",
        unidadeMedida: editalItem?.unidadeMedida ?? null,
        lote: editalItem?.lote ?? null,
        tipoItem: editalItem?.tipoItem ?? null,
        valorReferencia: toDecimalString(editalItem?.valorUnitarioEstimado),
        marca: pricing?.ofertaMarca ?? companyItem?.marca ?? null,
        modelo: pricing?.ofertaModelo ?? null,
        garantia: pricing?.garantiaDescricao ?? null,
        companyItem: normalizeCompanyItem(companyItem),
    };
}

function normalizeOpportunityItem(item: any) {
    const editalItem = item.editalItem;

    return {
        id: item.id,
        isSelected: item.isSelected,
        status: item.status,
        itemNumero: editalItem?.numeroItem ?? null,
        descricao: editalItem?.descricao ?? "Item sem descricao",
        lote: editalItem?.lote ?? null,
        tipoItem: editalItem?.tipoItem ?? null,
        unidadeMedida: editalItem?.unidadeMedida ?? null,
        quantidadeTotal: toDecimalString(editalItem?.quantidadeTotal),
        valorUnitarioEstimado: toDecimalString(editalItem?.valorUnitarioEstimado),
        valorTotalEstimado: toDecimalString(editalItem?.valorTotalEstimado),
        pricing: item.pricing
            ? {
                quantidadeCotada: toDecimalString(item.pricing.quantidadeCotada),
                precoOfertaUnitario: toDecimalString(item.pricing.precoOfertaUnitario),
                precoOfertaTotal: toDecimalString(item.pricing.precoOfertaTotal),
                ofertaMarca: item.pricing.ofertaMarca ?? null,
                ofertaModelo: item.pricing.ofertaModelo ?? null,
                garantiaDescricao: item.pricing.garantiaDescricao ?? null,
            }
            : null,
        companyItem: normalizeCompanyItem(item.companyItem),
    };
}

function normalizeEmpenhoItem(item: any) {
    const contratoItem = item.contratoItem ? normalizeContratoItem(item.contratoItem) : null;

    return {
        ...item,
        contratoItem,
        quantidade: toDecimalString(item.quantidade) ?? "0",
        valorUnitario: toDecimalString(item.valorUnitario),
        valorTotal: toDecimalString(item.valorTotal),
        quantidadeEntregue: toDecimalString(item.quantidadeEntregue) ?? "0",
        quantidadeAceita: toDecimalString(item.quantidadeAceita) ?? "0",
        quantidadePaga: toDecimalString(item.quantidadePaga) ?? "0",
        entregas: (item.entregas ?? []).map((entrega: any) => ({
            ...entrega,
            quantidade: toDecimalString(entrega.quantidadeEntregue) ?? "0",
            quantidadeEntregue: toDecimalString(entrega.quantidadeEntregue) ?? "0",
            valorNotaFiscal: toDecimalString(entrega.valorNotaFiscal),
            observacoes: entrega.observacao ?? null,
            empenhoItem: {
                id: item.id,
                contratoItem,
            },
        })),
    };
}

export class GetContratoWorkspaceMapper {
    static toView(data: any): GetContratoWorkspaceView {
        const itens = (data.itens ?? []).map(normalizeContratoItem);
        const contractedOpportunityItemIds = new Set(itens.map((item: any) => item.oportunidadeItemId));
        const itensDisponiveis = (data.oportunidade?.itens ?? [])
            .filter((item: any) => item.isSelected !== false && !contractedOpportunityItemIds.has(item.id))
            .map(normalizeOpportunityItem);
        const empenhos = (data.empenhos ?? []).map((empenho: any) => {
            const itensEmpenho = (empenho.itens ?? []).map(normalizeEmpenhoItem);
            const entregas = itensEmpenho.flatMap((item: any) => item.entregas ?? []);

            return {
                ...empenho,
                valor: toDecimalString(empenho.valor) ?? "0",
                itens: itensEmpenho,
                entregas,
                locaisEntrega: (empenho.locaisEntrega ?? []).map((local: any) => ({
                    ...local,
                    orgaoNome: local.descricao ?? null,
                    logradouro: local.endereco ?? null,
                    cidade: local.municipio ?? null,
                    estado: local.uf ?? null,
                    contatoNome: local.responsavel ?? null,
                })),
            };
        });
        const oportunidade = data.oportunidade
            ? {
                ...data.oportunidade,
                itens: undefined,
            }
            : data.oportunidade;

        return {
            data: {
                ...data,
                oportunidade,
                contrato: ContratoMapper.toView(data),
                itens,
                itensDisponiveis,
                empenhos,
            },
        };
    }
}
