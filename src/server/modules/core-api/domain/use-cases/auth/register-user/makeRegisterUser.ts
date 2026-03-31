import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import { RegisterUser } from "./RegisterUser";
import { RegisterUserController } from "./RegisterUserController";

export function makeRegisterUser(): RegisterUserController {
    const useCase = new RegisterUser(new PrismaUserRepository()   );
    return new RegisterUserController(useCase);
}
