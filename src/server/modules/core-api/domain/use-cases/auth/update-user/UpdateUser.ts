import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import type { UpdateUserDTO } from "./dtos/UpdateUserDTOs";
import { UpdateUserMapper, type UpdateUserView } from "./dtos/UpdateUserView";

export class UpdateUser {
  constructor(private readonly repository: PrismaUserRepository) {}

  async execute(params: UpdateUser.Params): Promise<UpdateUser.Response> {
    const { id, data } = params;
    const result = await this.repository.update({ id, data });
    return UpdateUserMapper.toView(result);
  }
}

export namespace UpdateUser {
  export type Params = UpdateUserDTO;
  export type Response = UpdateUserView;
}
