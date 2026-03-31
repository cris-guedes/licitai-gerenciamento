import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import type { RegisterUserDTO } from "./dtos/RegisterUserDTOs";
import { RegisterUserMapper, type RegisterUserView } from "./dtos/RegisterUserView";

export class RegisterUser {
    constructor(private readonly repository: PrismaUserRepository) { }

    async execute(params: RegisterUser.Params): Promise<RegisterUser.Response> {
        const result = await this.repository.create(params as any);
        return RegisterUserMapper.toView(result);
    }
}

export namespace RegisterUser {
    export type Params = RegisterUserDTO;
    export type Response = RegisterUserView;
}
