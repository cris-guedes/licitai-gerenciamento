import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type FetchUserView = PrismaUserRepository.UserResponse | null;

export class FetchUserMapper {
    static toView(data: FetchUserView): FetchUserView {
        return data;
    }
}
