import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListCompanyItems } from "./ListCompanyItems";
import { ListCompanyItemsController } from "./ListCompanyItemsController";

export function makeListCompanyItems(): ListCompanyItemsController {
    return new ListCompanyItemsController(
        new ListCompanyItems(
            new PrismaCompanyItemRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
