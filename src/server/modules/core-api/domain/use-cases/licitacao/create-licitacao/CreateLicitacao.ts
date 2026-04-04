import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import { CreateLicitacaoMapper, type CreateLicitacaoView } from "./dtos/CreateLicitacaoView";
import type { CreateLicitacaoDTO } from "./dtos/CreateLicitacaoDTOs";
import { prisma } from "@/server/shared/infra/db/client";

export class CreateLicitacao {
    constructor(
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateLicitacao.Params): Promise<CreateLicitacao.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        const { edital, tender } = await prisma.$transaction(async (tx) => {
            const edital = await tx.edital.create({
                data: {
                    orgId:                 params.orgId,
                    companyId:             params.companyId,
                    object:                params.object,
                    modality:              params.modality,
                    contractType:          params.contractType          ?? null,
                    estimatedValue:        params.estimatedValue        ?? null,
                    editalNumber:          params.editalNumber          ?? null,
                    portal:                params.portal                ?? null,
                    sphere:                params.sphere                ?? null,
                    state:                 params.state                 ?? null,
                    editalUrl:             params.editalUrl             ?? null,
                    publicationDate:       params.publicationDate       ?? null,
                    openingDate:           params.openingDate           ?? null,
                    proposalDeadline:      params.proposalDeadline      ?? null,
                    processNumber:         params.processNumber         ?? null,
                    uasg:                  params.uasg                  ?? null,
                    proposalDeadlineTime:  params.proposalDeadlineTime  ?? null,
                    bidInterval:           params.bidInterval            ?? null,
                    judgmentCriteria:      params.judgmentCriteria      ?? null,
                    disputeMode:           params.disputeMode            ?? null,
                    proposalValidityDays:  params.proposalValidityDays  ?? null,
                    clarificationDeadline: params.clarificationDeadline ?? null,
                    regionality:           params.regionality            ?? null,
                    exclusiveSmallBusiness: params.exclusiveSmallBusiness ?? false,
                    allowsAdhesion:         params.allowsAdhesion         ?? false,
                },
            });

            const tender = await tx.tender.create({
                data: {
                    orgId:     params.orgId,
                    companyId: params.companyId,
                    editalId:  edital.id,
                    status:    "open",
                    phase:     "edital",
                },
            });

            if (params.rules) {
                await tx.editalRules.create({
                    data: { editalId: edital.id, ...params.rules },
                });
            }

            if (params.logistics) {
                await tx.editalLogistics.create({
                    data: { editalId: edital.id, ...params.logistics },
                });
            }

            if (params.requiredDocuments?.length) {
                await tx.editalRequiredDocument.createMany({
                    data:           params.requiredDocuments.map((documentType) => ({ editalId: edital.id, documentType })),
                    skipDuplicates: true,
                });
            }

            if (params.managingAgencies?.length) {
                for (const ag of params.managingAgencies) {
                    let agency = await tx.agency.findFirst({
                        where: { orgId: params.orgId, name: ag.name },
                    });
                    if (!agency) {
                        agency = await tx.agency.create({
                            data: { orgId: params.orgId, companyId: params.companyId, name: ag.name, cnpj: ag.cnpj ?? null },
                        });
                    }
                    await tx.editalManagingAgency.create({ data: { editalId: edital.id, agencyId: agency.id } });
                }
            }

            if (params.participatingAgencies?.length) {
                for (const ag of params.participatingAgencies) {
                    let agency = await tx.agency.findFirst({
                        where: { orgId: params.orgId, name: ag.name },
                    });
                    if (!agency) {
                        agency = await tx.agency.create({
                            data: { orgId: params.orgId, companyId: params.companyId, name: ag.name, cnpj: ag.cnpj ?? null },
                        });
                    }
                    await tx.editalParticipatingAgency.create({ data: { editalId: edital.id, agencyId: agency.id } });
                }
            }

            return { edital, tender };
        });

        return CreateLicitacaoMapper.toView(edital, tender);
    }
}

export namespace CreateLicitacao {
    export type Params = CreateLicitacaoDTO & { userId: string };
    export type Response = CreateLicitacaoView;
}
