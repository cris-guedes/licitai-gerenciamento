import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import type { DeleteUserDTO } from "./dtos/DeleteUserDTOs";
import { DeleteUserMapper, type DeleteUserView } from "./dtos/DeleteUserView";

export class DeleteUser {
  constructor(private readonly repository: PrismaUserRepository) {}

  async execute(params: DeleteUser.Params): Promise<DeleteUser.Response> {
    const result = await this.repository.delete({ id: params.id });
    return DeleteUserMapper.toView(result);
  }
}

export namespace DeleteUser {
  export type Params = DeleteUserDTO;
  export type Response = DeleteUserView;
}
