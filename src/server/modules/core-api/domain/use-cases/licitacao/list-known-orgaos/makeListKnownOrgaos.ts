import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { ListKnownOrgaos } from "./ListKnownOrgaos";
import { ListKnownOrgaosController } from "./ListKnownOrgaosController";

export function makeListKnownOrgaos(): ListKnownOrgaosController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new ListKnownOrgaos(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new ListKnownOrgaosController(useCase);
}
