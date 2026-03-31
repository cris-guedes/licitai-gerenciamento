import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type UpdateUserView = PrismaUserRepository.UserResponse;

export class UpdateUserMapper {
  static toView(data: UpdateUserView): UpdateUserView {
    return data;
  }
}
