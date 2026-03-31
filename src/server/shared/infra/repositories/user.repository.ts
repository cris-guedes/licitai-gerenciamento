import { prisma } from "../db/client";

export class PrismaUserRepository {
    async create(data: PrismaUserRepository.CreateParams): Promise<PrismaUserRepository.UserResponse> {
        return prisma.user.create({ data });
    }

    async findByEmail({ email }: PrismaUserRepository.FindByEmailParams): Promise<PrismaUserRepository.UserResponse | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async findById({ id }: PrismaUserRepository.FindByIdParams): Promise<PrismaUserRepository.UserResponse | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async findByField({ field, value }: PrismaUserRepository.FindByFieldParams): Promise<PrismaUserRepository.UserResponse | null> {
        return prisma.user.findFirst({
            where: {
                [field]: value
            }
        });
    }

    async update({ id, data }: PrismaUserRepository.UpdateParams): Promise<PrismaUserRepository.UserResponse> {
        return prisma.user.update({ where: { id }, data });
    }

    async delete({ id }: PrismaUserRepository.DeleteParams): Promise<PrismaUserRepository.UserResponse> {
        return prisma.user.delete({ where: { id } });
    }
}

export namespace PrismaUserRepository {
    export type CreateParams = {
        id?: string;
        email: string;
        password?: string | null;
        name: string;
        emailVerified: boolean;
        image?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    };

    export type UserResponse = {
        id: string;
        email: string;
        password: string | null;
        name: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    };

    export type FindByEmailParams = {
        email: string;
    };

    export type FindByIdParams = {
        id: string;
    };

    export type FindByFieldParams = {
        field: string;
        value: any;
    };

    export type UpdateParams = {
        id: string;
        data: Partial<UserResponse>;
    };

    export type DeleteParams = {
        id: string;
    };
}
