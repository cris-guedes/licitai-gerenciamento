import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type UpdateUserDTO = {
  id: string;
  data: Partial<Pick<PrismaUserRepository.UserResponse, "email" | "password" | "name" | "emailVerified" | "image">>;
};
