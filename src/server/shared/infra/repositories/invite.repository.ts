import { prisma } from "../db/client";

export class PrismaInviteRepository {
    async create(data: PrismaInviteRepository.CreateParams): Promise<PrismaInviteRepository.InviteResponse> {
        return prisma.invite.create({ data });
    }

    async findByToken({ token }: { token: string }): Promise<PrismaInviteRepository.InviteWithRelations | null> {
        return prisma.invite.findUnique({
            where: { token },
            include: {
                organization: { select: { id: true, name: true } },
                company:      { select: { id: true, razao_social: true, nome_fantasia: true } },
            },
        });
    }

    async markUsed({ token }: { token: string }): Promise<void> {
        await prisma.invite.update({
            where: { token },
            data:  { usedAt: new Date() },
        });
    }

    async findByEmailAndOrg({ email, organizationId }: { email: string; organizationId: string }): Promise<PrismaInviteRepository.InviteResponse | null> {
        return prisma.invite.findFirst({
            where: { email, organizationId, usedAt: null },
        });
    }
}

export namespace PrismaInviteRepository {
    export type CreateParams = {
        token:          string;
        email:          string;
        role:           "OWNER" | "ADMIN" | "MEMBER";
        organizationId: string;
        companyId:      string;
        createdById:    string;
        expiresAt:      Date;
    };

    export type InviteResponse = {
        id:             string;
        token:          string;
        email:          string;
        role:           "OWNER" | "ADMIN" | "MEMBER";
        organizationId: string;
        companyId:      string;
        createdById:    string;
        expiresAt:      Date;
        usedAt:         Date | null;
        createdAt:      Date;
        updatedAt:      Date;
    };

    export type InviteWithRelations = InviteResponse & {
        organization: { id: string; name: string };
        company:      { id: string; razao_social: string; nome_fantasia: string | null };
    };
}
