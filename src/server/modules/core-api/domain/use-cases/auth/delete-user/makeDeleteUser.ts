import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import { DeleteUser } from "./DeleteUser";
import { DeleteUserController } from "./DeleteUserController";

export function makeDeleteUser(): DeleteUserController {
  const useCase = new DeleteUser(new PrismaUserRepository());
  return new DeleteUserController(useCase);
}
