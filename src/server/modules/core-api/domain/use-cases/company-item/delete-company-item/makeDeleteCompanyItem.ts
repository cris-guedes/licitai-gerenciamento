import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { DeleteCompanyItem } from "./DeleteCompanyItem";
import { DeleteCompanyItemController } from "./DeleteCompanyItemController";

export function makeDeleteCompanyItem(): DeleteCompanyItemController {
    return new DeleteCompanyItemController(
        new DeleteCompanyItem(
            new PrismaCompanyItemRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
