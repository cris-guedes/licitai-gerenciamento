import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type RegisterUserView = PrismaUserRepository.UserResponse;

export class RegisterUserMapper {
    static toView(data: RegisterUserView): RegisterUserView {
        return data;
    }
}
