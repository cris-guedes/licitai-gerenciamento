import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import { UpdateUser } from "./UpdateUser";
import { UpdateUserController } from "./UpdateUserController";

export function makeUpdateUser(): UpdateUserController {
  const useCase = new UpdateUser(new PrismaUserRepository());
  return new UpdateUserController(useCase);
}
