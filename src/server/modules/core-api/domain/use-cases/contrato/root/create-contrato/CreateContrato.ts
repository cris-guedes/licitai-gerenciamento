/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CreateContratoDTO } from "./dtos/CreateContratoDTOs";
import { CreateContratoMapper, CreateContratoView } from "./dtos/CreateContratoView";
import { ContratoStatus } from "@prisma/client";

export class CreateContrato {
    constructor(
        private readonly contratoRepository: PrismaContratoRepository,
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
    ) { }

    async execute(params: CreateContrato.Params): Promise<CreateContrato.Response> {
        // Validate opportunity exists and belongs to company
        const oportunidade = await this.oportunidadeRepository.findById({
            id: params.oportunidadeId,
            companyId: params.companyId,
        });

        if (!oportunidade) {
            const error = new Error("Oportunidade não encontrada") as Error & { statusCode: number };
            error.statusCode = 404;
            throw error;
        }

        const orgaoContratante = params.orgaoContratante
            ? await this.resolveOrgaoContratante(params)
            : undefined;
        const itens = params.itens.length > 0
            ? params.itens
            : (await this.oportunidadeRepository.listItemsByOportunidadeId({
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
                selectedOnly: true,
            })).map(item => ({
                oportunidadeItemId: item.id,
                quantidadeContratada: item.pricing?.quantidadeCotada !== null && item.pricing?.quantidadeCotada !== undefined
                    ? Number(item.pricing.quantidadeCotada)
                    : (item.editalItem.quantidadeTotal === null ? undefined : Number(item.editalItem.quantidadeTotal)),
                valorUnitario: item.pricing?.precoOfertaUnitario !== null && item.pricing?.precoOfertaUnitario !== undefined
                    ? Number(item.pricing.precoOfertaUnitario)
                    : (item.editalItem.valorUnitarioEstimado === null ? undefined : Number(item.editalItem.valorUnitarioEstimado)),
                valorTotal: item.pricing?.precoOfertaTotal !== null && item.pricing?.precoOfertaTotal !== undefined
                    ? Number(item.pricing.precoOfertaTotal)
                    : (item.editalItem.valorTotalEstimado === null ? undefined : Number(item.editalItem.valorTotalEstimado)),
            }));
        const valorGlobal = params.valorGlobal
            || params.valorTotal
            || itens.reduce((total, item) => total + Number(item.valorTotal ?? 0), 0)
            || undefined;

        const contrato = await this.contratoRepository.create({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            status: (params.status ?? "RASCUNHO") as ContratoStatus,
            numeroContrato: params.numeroContrato,
            anoContrato: params.anoContrato,
            processo: params.processo,
            tipoContrato: params.tipoContrato,
            objetoContrato: params.objetoContrato,
            dataAssinatura: params.dataAssinatura,
            dataVigenciaInicio: params.dataVigenciaInicio,
            dataVigenciaFim: params.dataVigenciaFim,
            fornecedorCnpjCpf: params.fornecedorCnpjCpf,
            fornecedorNome: params.fornecedorNome,
            valorInicial: params.valorInicial,
            valorGlobal,
            metadata: orgaoContratante ? { orgaoContratante } : undefined,
            itens,
        });

        return CreateContratoMapper.toView(contrato);
    }

    private async resolveOrgaoContratante(params: CreateContrato.Params) {
        if (!params.orgaoContratante) return undefined;

        if (!params.orgaoContratante.editalOrgaoId) {
            return params.orgaoContratante;
        }

        const workspace = await this.oportunidadeRepository.findWorkspaceById({
            oportunidadeId: params.oportunidadeId,
            companyId: params.companyId,
        });
        const editalOrgao = workspace?.edital?.orgaos.find(orgao => orgao.id === params.orgaoContratante?.editalOrgaoId);

        if (!editalOrgao) {
            const error = new Error("Órgão contratante não pertence à oportunidade") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        return {
            editalOrgaoId: editalOrgao.id,
            orgaoId: editalOrgao.orgao.id,
            papel: editalOrgao.papel,
            cnpj: editalOrgao.orgao.cnpj,
            razaoSocial: editalOrgao.orgao.razaoSocial,
            codigoUnidade: editalOrgao.orgao.codigoUnidade,
            nomeUnidade: editalOrgao.orgao.nomeUnidade,
            municipio: editalOrgao.orgao.municipio,
            uf: editalOrgao.orgao.uf,
            esfera: editalOrgao.orgao.esfera,
            poder: editalOrgao.orgao.poder,
        };
    }
}

export namespace CreateContrato {
    export type Params = CreateContratoDTO;
    export type Response = CreateContratoView;
}
