import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import { FetchUser } from "./FetchUser";
import { FetchUserController } from "./FetchUserController";

export function makeFetchUser(): FetchUserController {
    const useCase = new FetchUser(new PrismaUserRepository());
    return new FetchUserController(useCase);
}
