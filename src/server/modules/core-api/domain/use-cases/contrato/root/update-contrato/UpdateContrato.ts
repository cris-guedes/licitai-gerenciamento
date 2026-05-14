import { ContratoStatus } from "@prisma/client";
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { ContratoMapper, type ContratoView } from "../create-contrato/dtos/CreateContratoView";
import type { UpdateContratoDTO } from "./dtos/UpdateContratoDTOs";

export class UpdateContrato {
    constructor(private readonly contratoRepository: PrismaContratoRepository) {}

    async execute(params: UpdateContrato.Params): Promise<UpdateContrato.Response> {
        const contrato = await this.contratoRepository.findById({
            id: params.contratoId,
            companyId: params.companyId,
        });

        if (!contrato) {
            const error = new Error("Contrato não encontrado");
            (error as any).statusCode = 404;
            throw error;
        }

        const updated = await this.contratoRepository.update({
            id: params.contratoId,
            companyId: params.companyId,
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
            valorGlobal: params.valorGlobal ?? params.valorTotal,
            status: params.status as ContratoStatus | undefined,
        });

        return ContratoMapper.toView(updated);
    }
}

export namespace UpdateContrato {
    export type Params = UpdateContratoDTO;
    export type Response = ContratoView;
}
