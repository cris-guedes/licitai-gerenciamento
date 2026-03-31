import type { RouteConfig } from "../adapters/http-adapter";
import { makeOnboarding } from "../../domain/use-cases/onboarding/onboarding/makeOnboarding";
import { authMiddleware } from "../middlewares/auth";

export const onboardingRoutes: Record<string, RouteConfig> = {
    "onboarding": {
        make:        makeOnboarding,
        method:      "POST",
        preHandlers: [authMiddleware],
    },
};
