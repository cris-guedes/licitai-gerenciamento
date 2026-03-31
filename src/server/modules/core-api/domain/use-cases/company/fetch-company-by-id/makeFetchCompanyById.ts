import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { FetchCompanyById } from "./FetchCompanyById";
import { FetchCompanyByIdController } from "./FetchCompanyByIdController";

export function makeFetchCompanyById(): FetchCompanyByIdController {
    return new FetchCompanyByIdController(
        new FetchCompanyById(
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
