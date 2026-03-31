import { prisma } from "../db/client";

export class PrismaMembershipRepository {
    async findFirstByUserId({ userId }: { userId: string }): Promise<PrismaMembershipRepository.MembershipWithCompany | null> {
        return prisma.membership.findFirst({
            where: { userId },
            include: { companyMemberships: { take: 1 } },
        });
    }

    async findByOrganizationId({ organizationId }: { organizationId: string }): Promise<PrismaMembershipRepository.MembershipWithUser[]> {
        return prisma.membership.findMany({
            where: { organizationId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" },
        });
    }

    async findByUserIdAndOrganizationId({
        userId,
        organizationId,
    }: {
        userId: string;
        organizationId: string;
    }): Promise<PrismaMembershipRepository.MembershipResponse | null> {
        return prisma.membership.findFirst({
            where: {
                userId,
                organizationId,
            },
        });
    }

    async findById({ id }: { id: string }): Promise<PrismaMembershipRepository.MembershipResponse | null> {
        return prisma.membership.findUnique({ where: { id } });
    }

    async createMember(params: PrismaMembershipRepository.CreateMemberParams): Promise<PrismaMembershipRepository.MembershipResponse> {
        return prisma.$transaction(async (tx) => {
            const membership = await tx.membership.create({
                data: {
                    userId:         params.userId,
                    organizationId: params.organizationId,
                    role:           params.role,
                },
            });

            await tx.companyMembership.create({
                data: { membershipId: membership.id, companyId: params.companyId },
            });

            return membership;
        });
    }

    async updateRole({ id, role }: { id: string; role: "OWNER" | "ADMIN" | "MEMBER" }): Promise<PrismaMembershipRepository.MembershipResponse> {
        return prisma.membership.update({ where: { id }, data: { role } });
    }

    async delete({ id }: { id: string }): Promise<void> {
        await prisma.membership.delete({ where: { id } });
    }

    async createOwner(params: PrismaMembershipRepository.CreateOwnerParams): Promise<PrismaMembershipRepository.MembershipResponse> {
        return prisma.$transaction(async (tx) => {
            const membership = await tx.membership.create({
                data: {
                    userId:         params.userId,
                    organizationId: params.organizationId,
                    role:           "OWNER",
                },
            });

            await tx.companyMembership.create({
                data: {
                    membershipId: membership.id,
                    companyId:    params.companyId,
                },
            });

            return membership;
        });
    }
}

export namespace PrismaMembershipRepository {
    export type CreateOwnerParams = {
        userId:         string;
        organizationId: string;
        companyId:      string;
    };

    export type MembershipResponse = {
        id:             string;
        role:           string;
        userId:         string;
        organizationId: string;
        createdAt:      Date;
        updatedAt:      Date;
    };

    export type MembershipWithCompany = MembershipResponse & {
        companyMemberships: { companyId: string }[];
    };

    export type MembershipWithUser = MembershipResponse & {
        user: { id: string; name: string; email: string };
    };

    export type CreateMemberParams = {
        userId:         string;
        organizationId: string;
        companyId:      string;
        role:           "OWNER" | "ADMIN" | "MEMBER";
    };
}
