import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { UpdateCompany } from "./UpdateCompany";
import { UpdateCompanyController } from "./UpdateCompanyController";

export function makeUpdateCompany(): UpdateCompanyController {
    return new UpdateCompanyController(
        new UpdateCompany(
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
