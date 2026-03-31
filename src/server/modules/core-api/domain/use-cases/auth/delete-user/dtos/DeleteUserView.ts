import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type DeleteUserView = PrismaUserRepository.UserResponse;

export class DeleteUserMapper {
  static toView(data: DeleteUserView): DeleteUserView {
    return data;
  }
}
