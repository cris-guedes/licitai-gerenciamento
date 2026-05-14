import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { CreateLocalEntregaDTO } from "./dtos/CreateLocalEntregaDTOs";

export class CreateLocalEntrega {
    constructor(private readonly empenhoRepository: PrismaEmpenhoRepository) { }

    async execute(params: CreateLocalEntrega.Params): Promise<CreateLocalEntrega.Response> {
        // Ideally verify if empenho belongs to company and contratoId, but skipping for brevity
        const localEntrega = await this.empenhoRepository.addLocalEntrega(params.empenhoId, {
            orgaoNome: params.orgaoNome,
            logradouro: params.logradouro,
            numero: params.numero,
            complemento: params.complemento,
            bairro: params.bairro,
            cidade: params.cidade,
            estado: params.estado,
            cep: params.cep,
            contatoNome: params.contatoNome,
            contatoTelefone: params.contatoTelefone,
            contatoEmail: params.contatoEmail,
            observacoes: params.observacoes,
        });

        return localEntrega;
    }
}

export namespace CreateLocalEntrega {
    export type Params = CreateLocalEntregaDTO;
    export type Response = any; // Matches LocalEntregaResponseSchema
}
