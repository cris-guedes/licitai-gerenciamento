export type CreateEntregaItemView = {
    id: string;
    empenhoItemId: string;
    localEntregaId?: string | null;
    quantidadeEntregue: string;
    dataEntrega?: string | null;
    status: string;
    observacao: string | null;
};

export type CreateEntregaView = {
    entregas: CreateEntregaItemView[];
};

export class CreateEntregaMapper {
    static toView(entregas: unknown[]): CreateEntregaView {
        return {
            entregas: entregas.map(toEntregaView),
        };
    }
}

function toEntregaView(value: unknown): CreateEntregaItemView {
    const entrega = value as {
        id?: unknown;
        empenhoItemId?: unknown;
        localEntregaId?: unknown;
        quantidadeEntregue?: unknown;
        dataEntrega?: unknown;
        status?: unknown;
        observacao?: unknown;
    };

    return {
        id: String(entrega.id ?? ""),
        empenhoItemId: String(entrega.empenhoItemId ?? ""),
        localEntregaId: toNullableString(entrega.localEntregaId),
        quantidadeEntregue: toDecimalString(entrega.quantidadeEntregue) ?? "0",
        dataEntrega: toIsoString(entrega.dataEntrega),
        status: String(entrega.status ?? ""),
        observacao: toNullableString(entrega.observacao),
    };
}

function toDecimalString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function toNullableString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function toIsoString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    return String(value);
}
