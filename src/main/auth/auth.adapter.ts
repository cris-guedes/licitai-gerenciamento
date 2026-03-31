import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "../../server/shared/infra/db/client";
import { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient";

export const customAuthAdapter = (options: any) => {
    const baseAdapter = prismaAdapter(prisma, { provider: "postgresql" })(options);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const api = new CoreApiClient({ BASE: `${appUrl}/api/core` });

    return {
        ...baseAdapter,

        async create(data: any) {
            if (data.model === 'user') {
                const user = await api.auth.registerUser({ requestBody: data.data });
                return user as any;
            }
            return baseAdapter.create(data);
        },

        async findOne(data: any) {
            return baseAdapter.findOne(data);
        },

        async findMany(data: any) {
            return baseAdapter.findMany(data);
        },

        async update(data: any) {
            return baseAdapter.update(data);
        },

        async delete(data: any) {
            return baseAdapter.delete(data);
        },
    };
};
