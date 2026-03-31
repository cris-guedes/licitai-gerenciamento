import { prisma } from "../db/client";

export class PrismaAccountRepository {
    async createCredentialAccount(params: PrismaAccountRepository.CreateCredentialParams): Promise<void> {
        await prisma.account.create({
            data: {
                accountId:  params.userId,
                providerId: "credential",
                userId:     params.userId,
                password:   params.hashedPassword,
            },
        });
    }
}

export namespace PrismaAccountRepository {
    export type CreateCredentialParams = {
        userId:         string;
        hashedPassword: string;
    };
}
