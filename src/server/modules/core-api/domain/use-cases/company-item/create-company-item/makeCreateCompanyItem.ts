import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { CreateCompanyItem } from "./CreateCompanyItem";
import { CreateCompanyItemController } from "./CreateCompanyItemController";

export function makeCreateCompanyItem(): CreateCompanyItemController {
    return new CreateCompanyItemController(
        new CreateCompanyItem(
            new PrismaCompanyItemRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
        ),
    );
}
