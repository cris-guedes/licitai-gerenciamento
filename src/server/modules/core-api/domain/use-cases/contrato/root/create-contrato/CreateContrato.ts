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
            const error = new Error("Oportunidade não encontrada");
            (error as any).statusCode = 404;
            throw error;
        }

        const itens = params.itens.length > 0
            ? params.itens
            : (await this.oportunidadeRepository.listItemsByOportunidadeId({
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
            })).map(item => ({
                oportunidadeItemId: item.id,
                quantidadeContratada: item.editalItem.quantidadeTotal === null
                    ? undefined
                    : Number(item.editalItem.quantidadeTotal),
                valorUnitario: item.editalItem.valorUnitarioEstimado === null
                    ? undefined
                    : Number(item.editalItem.valorUnitarioEstimado),
                valorTotal: item.editalItem.valorTotalEstimado === null
                    ? undefined
                    : Number(item.editalItem.valorTotalEstimado),
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
            itens,
        });

        return CreateContratoMapper.toView(contrato);
    }
}

export namespace CreateContrato {
    export type Params = CreateContratoDTO;
    export type Response = CreateContratoView;
}
