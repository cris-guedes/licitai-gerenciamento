import type { PrismaEditalRepository } from "@/server/shared/infra/repositories/edital.repository";
import type { PrismaTenderRepository } from "@/server/shared/infra/repositories/tender.repository";

export type CreateLicitacaoView = {
    edital: PrismaEditalRepository.EditalResponse;
    tender: PrismaTenderRepository.TenderResponse;
};

export class CreateLicitacaoMapper {
    static toView(
        edital: PrismaEditalRepository.EditalResponse,
        tender: PrismaTenderRepository.TenderResponse,
    ): CreateLicitacaoView {
        return { edital, tender };
    }
}
