import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { UpdateOportunidadeItem } from "./UpdateOportunidadeItem";
import { UpdateOportunidadeItemController } from "./UpdateOportunidadeItemController";

export function makeUpdateOportunidadeItem(): UpdateOportunidadeItemController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyItemRepository = new PrismaCompanyItemRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new UpdateOportunidadeItem(
        oportunidadeRepository,
        companyItemRepository,
        companyRepository,
        membershipRepository,
    );

    return new UpdateOportunidadeItemController(useCase);
}
