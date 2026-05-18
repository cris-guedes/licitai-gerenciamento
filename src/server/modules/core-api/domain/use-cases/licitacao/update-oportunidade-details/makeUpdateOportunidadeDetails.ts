import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { UpdateOportunidadeDetails } from "./UpdateOportunidadeDetails";
import { UpdateOportunidadeDetailsController } from "./UpdateOportunidadeDetailsController";

export function makeUpdateOportunidadeDetails(): UpdateOportunidadeDetailsController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new UpdateOportunidadeDetails(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new UpdateOportunidadeDetailsController(useCase);
}
