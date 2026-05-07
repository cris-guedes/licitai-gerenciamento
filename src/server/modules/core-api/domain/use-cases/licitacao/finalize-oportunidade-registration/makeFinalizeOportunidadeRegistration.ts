import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { FinalizeOportunidadeRegistration } from "./FinalizeOportunidadeRegistration";
import { FinalizeOportunidadeRegistrationController } from "./FinalizeOportunidadeRegistrationController";

export function makeFinalizeOportunidadeRegistration() {
    return new FinalizeOportunidadeRegistrationController(
        new FinalizeOportunidadeRegistration(
            new PrismaOportunidadeRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            new PrismaWorkflowRepository(),
        ),
    );
}
