import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { DeleteUserControllerSchemas } from "./DeleteUserControllerSchemas";
import { DeleteUser } from "./DeleteUser";
import { z } from "zod";

interface DeleteUserControllerTypes {
  Body: DeleteUser.Params;
  Query: undefined;
  Params: undefined;
  Response: DeleteUser.Response;
}

export class DeleteUserController implements Controller<DeleteUserControllerTypes> {
  constructor(private readonly useCase: DeleteUser) {}

  async handle(request: HttpRequest<DeleteUserControllerTypes>): Promise<HttpResponse<DeleteUser.Response>> {
    try {
      const params = DeleteUserControllerSchemas.Body.parse(request.body);
      const result = await this.useCase.execute(params);
      return ok(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) return serverError(new Error(error.message));
      return serverError(error);
    }
  }
}

export namespace DeleteUserController {
  export type Types = DeleteUserControllerTypes;
  export type Body = DeleteUserControllerTypes["Body"];
  export type Response = DeleteUserControllerTypes["Response"];
}
