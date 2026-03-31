import { Controller, HttpRequest, HttpResponse, created, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { OnboardingControllerSchemas } from "./OnboardingControllerSchemas";
import { Onboarding } from "./Onboarding";
import { z } from "zod";

interface OnboardingControllerTypes {
    Body:     OnboardingControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: Onboarding.Response;
}

export class OnboardingController implements Controller<OnboardingControllerTypes> {
    constructor(private readonly useCase: Onboarding) {}

    async handle(request: HttpRequest<OnboardingControllerTypes>): Promise<HttpResponse<Onboarding.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = OnboardingControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                userId: request.user.id,
                ...body,
            });

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("já cadastrada")) return badRequest(error);
            return serverError(error);
        }
    }
}
