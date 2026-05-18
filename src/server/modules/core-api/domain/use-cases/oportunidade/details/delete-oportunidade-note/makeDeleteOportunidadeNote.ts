import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { DeleteOportunidadeNote } from "./DeleteOportunidadeNote";
import { DeleteOportunidadeNoteController } from "./DeleteOportunidadeNoteController";

export function makeDeleteOportunidadeNote(): DeleteOportunidadeNoteController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new DeleteOportunidadeNote(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new DeleteOportunidadeNoteController(useCase);
}
