import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { DeleteCompany } from "./DeleteCompany";
import { DeleteCompanyController } from "./DeleteCompanyController";

export function makeDeleteCompany(): DeleteCompanyController {
    return new DeleteCompanyController(
        new DeleteCompany(
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
