import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { UpdateCompanyItem } from "./UpdateCompanyItem";
import { UpdateCompanyItemController } from "./UpdateCompanyItemController";

export function makeUpdateCompanyItem(): UpdateCompanyItemController {
    return new UpdateCompanyItemController(
        new UpdateCompanyItem(
            new PrismaCompanyItemRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
