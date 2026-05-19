import type { Contrato } from "@/server/modules/core-api/domain/entities";

export type ContratoView = {
    id: string;
    oportunidadeId: string;
    companyId: string;
    numeroContrato: string | null;
    anoContrato: number | null;
    processo: string | null;
    objetoContrato: string | null;
    tipoContrato: string | null;
    fornecedorCnpjCpf: string | null;
    fornecedorNome: string | null;
    valorInicial: string | null;
    valorGlobal: string | null;
    valorTotal: string | null;
    dataAssinatura: string | null;
    dataVigenciaInicio: string | null;
    dataVigenciaFim: string | null;
    status: string;
    orgaoContratante: ContratoOrgaoContratanteView | null;
    createdAt: string;
    updatedAt: string;
    itens?: unknown[];
    oportunidade?: {
        id: string;
        title: string;
        numero: string | null;
        orgaoNome: string | null;
        valorEstimado: string | null;
    } | null;
};

export type CreateContratoView = ContratoView;

export type ContratoOrgaoContratanteView = {
    editalOrgaoId?: string | null;
    orgaoId?: string | null;
    papel?: string | null;
    cnpj?: string | null;
    razaoSocial?: string | null;
    codigoUnidade?: string | null;
    nomeUnidade?: string | null;
    municipio?: string | null;
    uf?: string | null;
    esfera?: string | null;
    poder?: string | null;
};

function toIsoDate(value: unknown): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

function toDecimalString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function toOrgaoContratanteView(metadata: unknown): ContratoOrgaoContratanteView | null {
    const objectMetadata = metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? metadata as Record<string, unknown>
        : null;
    const orgao = objectMetadata?.orgaoContratante;

    if (!orgao || typeof orgao !== "object" || Array.isArray(orgao)) return null;

    const source = orgao as Record<string, unknown>;
    return {
        editalOrgaoId: toNullableString(source.editalOrgaoId),
        orgaoId: toNullableString(source.orgaoId),
        papel: toNullableString(source.papel),
        cnpj: toNullableString(source.cnpj),
        razaoSocial: toNullableString(source.razaoSocial),
        codigoUnidade: toNullableString(source.codigoUnidade),
        nomeUnidade: toNullableString(source.nomeUnidade),
        municipio: toNullableString(source.municipio),
        uf: toNullableString(source.uf),
        esfera: toNullableString(source.esfera),
        poder: toNullableString(source.poder),
    };
}

function toNullableString(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    return String(value);
}

function toOportunidadeView(data: any): ContratoView["oportunidade"] {
    const oportunidade = data?.oportunidade;
    if (!oportunidade) return null;

    return {
        id: oportunidade.id,
        title: oportunidade.edital?.objeto
            ?? oportunidade.licitacao?.objetoResumo
            ?? oportunidade.edital?.numero
            ?? oportunidade.licitacao?.numeroLicitacao
            ?? "Oportunidade sem titulo",
        numero: oportunidade.edital?.numero ?? oportunidade.licitacao?.numeroLicitacao ?? null,
        orgaoNome: oportunidade.edital?.orgaoRazaoSocial ?? oportunidade.licitacao?.orgaoGerenciador?.razaoSocial ?? null,
        valorEstimado: toDecimalString(oportunidade.edital?.valorEstimado ?? oportunidade.licitacao?.valorEstimadoTotal ?? null),
    };
}

export class ContratoMapper {
    static toView(data: Contrato | any): ContratoView {
        const valorGlobal = toDecimalString(data.valorGlobal);

        return {
            id: data.id,
            oportunidadeId: data.oportunidadeId,
            companyId: data.companyId,
            numeroContrato: data.numeroContrato ?? null,
            anoContrato: data.anoContrato ?? null,
            processo: data.processo ?? null,
            objetoContrato: data.objetoContrato ?? null,
            tipoContrato: data.tipoContrato ?? null,
            fornecedorCnpjCpf: data.fornecedorCnpjCpf ?? null,
            fornecedorNome: data.fornecedorNome ?? null,
            valorInicial: toDecimalString(data.valorInicial),
            valorGlobal,
            valorTotal: valorGlobal,
            dataAssinatura: toIsoDate(data.dataAssinatura),
            dataVigenciaInicio: toIsoDate(data.dataVigenciaInicio),
            dataVigenciaFim: toIsoDate(data.dataVigenciaFim),
            status: data.status,
            orgaoContratante: toOrgaoContratanteView(data.metadata),
            createdAt: toIsoDate(data.createdAt) ?? new Date().toISOString(),
            updatedAt: toIsoDate(data.updatedAt) ?? new Date().toISOString(),
            itens: data.itens ?? undefined,
            oportunidade: toOportunidadeView(data),
        };
    }
}

export class CreateContratoMapper {
    static toView(data: Contrato): CreateContratoView {
        return ContratoMapper.toView(data);
    }
}
