import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { UpdateUserControllerSchemas } from "./UpdateUserControllerSchemas";
import { UpdateUser } from "./UpdateUser";
import { z } from "zod";

interface UpdateUserControllerTypes {
  Body: UpdateUser.Params;
  Query: undefined;
  Params: undefined;
  Response: UpdateUser.Response;
}

export class UpdateUserController implements Controller<UpdateUserControllerTypes> {
  constructor(private readonly useCase: UpdateUser) {}

  async handle(request: HttpRequest<UpdateUserControllerTypes>): Promise<HttpResponse<UpdateUser.Response>> {
    try {
      const params = UpdateUserControllerSchemas.Body.parse(request.body);
      const result = await this.useCase.execute(params);
      return ok(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) return serverError(new Error(error.message));
      return serverError(error);
    }
  }
}

export namespace UpdateUserController {
  export type Types = UpdateUserControllerTypes;
  export type Body = UpdateUserControllerTypes["Body"];
  export type Response = UpdateUserControllerTypes["Response"];
}
