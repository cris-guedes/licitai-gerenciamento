import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import type { FetchUserDTO } from "./dtos/FetchUserDTOs";
import { FetchUserMapper, type FetchUserView } from "./dtos/FetchUserView";

export class FetchUser {
    constructor(private readonly repository: PrismaUserRepository) { }

    async execute(params: FetchUser.Params): Promise<FetchUser.Response> {
        let result: FetchUserView = null;

        if (params.field === 'id') {
            result = await this.repository.findById({ id: params.value });
        } else if (params.field === 'email') {
            result = await this.repository.findByEmail({ email: params.value });
        } else {
            result = await this.repository.findByField({ field: params.field, value: params.value });
        }

        return FetchUserMapper.toView(result);
    }
}

export namespace FetchUser {
    export type Params = FetchUserDTO;
    export type Response = FetchUserView;
}
