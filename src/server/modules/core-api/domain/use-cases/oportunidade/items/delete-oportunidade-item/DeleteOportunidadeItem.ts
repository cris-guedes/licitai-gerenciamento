import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";

export type DeleteOportunidadeItemInput = {
    companyId: string;
    oportunidadeId: string;
    oportunidadeItemId: string;
};

export type DeleteOportunidadeItemOutput = {
    oportunidadeItemId: string;
};

export class DeleteOportunidadeItem {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
    ) { }

    async execute(input: DeleteOportunidadeItemInput): Promise<DeleteOportunidadeItemOutput> {
        const item = await this.oportunidadeRepository.findItemById({
            companyId: input.companyId,
            oportunidadeId: input.oportunidadeId,
            oportunidadeItemId: input.oportunidadeItemId,
        });

        if (!item) {
            throw new Error("Item não encontrado.");
        }

        await this.oportunidadeRepository.deleteItemManagement({
            oportunidadeItemId: input.oportunidadeItemId,
        });

        return {
            oportunidadeItemId: input.oportunidadeItemId,
        };
    }
}
