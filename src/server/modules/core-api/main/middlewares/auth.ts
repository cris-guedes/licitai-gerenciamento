import { makeAuthPreHandler } from "../adapters/auth-pre-handler";
import { makeGetUserByToken } from "../../domain/use-cases/auth/get-user-by-token/makeGetUserByToken";

/**
 * Middleware de autenticação. Verifica o Bearer token, busca o usuário e
 * injeta `request.user` antes do controller ser chamado.
 *
 * Uso em rotas protegidas:
 *   preHandlers: [authMiddleware]
 */
export const authMiddleware = makeAuthPreHandler(makeGetUserByToken());
