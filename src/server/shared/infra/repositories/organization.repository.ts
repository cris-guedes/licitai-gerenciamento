import { prisma } from "../db/client";

export class PrismaOrganizationRepository {
    async create(data: PrismaOrganizationRepository.CreateParams): Promise<PrismaOrganizationRepository.OrganizationResponse> {
        return prisma.organization.create({ data });
    }

    async findById({ id }: PrismaOrganizationRepository.FindByIdParams): Promise<PrismaOrganizationRepository.OrganizationResponse | null> {
        return prisma.organization.findUnique({ where: { id } });
    }

    async findBySlug({ slug }: { slug: string }): Promise<PrismaOrganizationRepository.OrganizationResponse | null> {
        return prisma.organization.findUnique({ where: { slug } });
    }
}

export namespace PrismaOrganizationRepository {
    export type CreateParams = {
        name: string;
        slug: string;
    };

    export type OrganizationResponse = {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    };

    export type FindByIdParams = {
        id: string;
    };
}
