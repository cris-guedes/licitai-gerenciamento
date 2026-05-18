import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CreateOportunidadeNote } from "./CreateOportunidadeNote";
import { CreateOportunidadeNoteController } from "./CreateOportunidadeNoteController";

export function makeCreateOportunidadeNote(): CreateOportunidadeNoteController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new CreateOportunidadeNote(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new CreateOportunidadeNoteController(useCase);
}
