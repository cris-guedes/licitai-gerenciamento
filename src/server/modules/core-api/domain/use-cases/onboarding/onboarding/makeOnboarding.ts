import { PrismaOrganizationRepository } from "@/server/shared/infra/repositories/organization.repository";
import { PrismaCompanyRepository }      from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository }   from "@/server/shared/infra/repositories/membership.repository";
import { Onboarding }           from "./Onboarding";
import { OnboardingController } from "./OnboardingController";

export function makeOnboarding(): OnboardingController {
    const useCase = new Onboarding(
        new PrismaOrganizationRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );
    return new OnboardingController(useCase);
}
