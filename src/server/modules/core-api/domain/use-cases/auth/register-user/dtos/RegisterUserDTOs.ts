import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export type RegisterUserDTO = PrismaUserRepository.CreateParams;
