import { ContratoMapper } from "../../create-contrato/dtos/CreateContratoView";

export type GetContratoWorkspaceView = {
    data: any;
};

function toDecimalString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function normalizeContratoItem(item: any) {
    const editalItem = item.oportunidadeItem?.editalItem;

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

        return {
            data: {
                ...data,
                contrato: ContratoMapper.toView(data),
                itens,
                empenhos,
            },
        };
    }
}
