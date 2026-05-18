import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { FetchCompanyItemById } from "./FetchCompanyItemById";
import { FetchCompanyItemByIdController } from "./FetchCompanyItemByIdController";

export function makeFetchCompanyItemById(): FetchCompanyItemByIdController {
    return new FetchCompanyItemByIdController(
        new FetchCompanyItemById(
            new PrismaCompanyItemRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
