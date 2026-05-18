import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";

export type CreateOportunidadeItemInput = {
    companyId: string;
    oportunidadeId: string;
    data: {
        numeroItem?: number | null;
        descricao?: string | null;
        quantidadeTotal?: number | null;
        valorUnitarioEstimado?: number | null;
        valorTotalEstimado?: number | null;
        unidadeMedida?: string | null;
    };
};

export type CreateOportunidadeItemOutput = PrismaOportunidadeRepository.OportunidadeItemRecord;

export class CreateOportunidadeItem {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
    ) { }

    async execute(input: CreateOportunidadeItemInput): Promise<CreateOportunidadeItemOutput> {
        const workspace = await this.oportunidadeRepository.findWorkspaceById({
            companyId: input.companyId,
            oportunidadeId: input.oportunidadeId,
        });

        if (!workspace) {
            throw new Error("Workspace da oportunidade não encontrado.");
        }

        return this.oportunidadeRepository.createItemManagement({
            oportunidadeId: input.oportunidadeId,
            data: {
                numeroItem: input.data.numeroItem,
                descricao: input.data.descricao,
                quantidadeTotal: input.data.quantidadeTotal,
                valorUnitarioEstimado: input.data.valorUnitarioEstimado,
                valorTotalEstimado: input.data.valorTotalEstimado,
                unidadeMedida: input.data.unidadeMedida,
            },
        });
    }
}
