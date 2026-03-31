import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListCompanies } from "./ListCompanies";
import { ListCompaniesController } from "./ListCompaniesController";

export function makeListCompanies(): ListCompaniesController {
    return new ListCompaniesController(
        new ListCompanies(
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
