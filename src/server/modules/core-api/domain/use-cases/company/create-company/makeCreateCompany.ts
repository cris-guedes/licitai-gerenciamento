import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { CreateCompany } from "./CreateCompany";
import { CreateCompanyController } from "./CreateCompanyController";

export function makeCreateCompany(): CreateCompanyController {
    return new CreateCompanyController(
        new CreateCompany(
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
