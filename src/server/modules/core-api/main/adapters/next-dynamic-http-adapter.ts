import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import type { Controller, ControllerContract, HttpRequest } from "./http-adapter";

type DynamicRouteContext<TParams extends Record<string, string>> = {
    params: Promise<TParams>;
};

function buildHeaders(request: NextRequest) {
    return Object.fromEntries(request.headers) as Record<string, string | undefined>;
}

function getErrorStatusCode(error: unknown): number {
    if (error && typeof error === "object" && "statusCode" in error && typeof error.statusCode === "number") {
        return error.statusCode;
    }

    return 500;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Erro interno do servidor.";
}

export function adaptNextDynamicRoute<TController extends ControllerContract, TParams extends Record<string, string>>(options: {
    make: () => Controller<TController>;
    parseBody?: (request: NextRequest) => Promise<TController["Body"]>;
    mapParams: (params: TParams) => TController["Params"];
    mapQuery?: (request: NextRequest) => TController["Query"];
}) {
    return async (request: NextRequest, context: DynamicRouteContext<TParams>) => {
        try {
            const routeParams = await context.params;
            let httpRequest: HttpRequest<TController> = {
                body: undefined as TController["Body"],
                query: (options.mapQuery?.(request) ?? null) as TController["Query"],
                params: options.mapParams(routeParams),
                headers: buildHeaders(request),
            };

            httpRequest = await authMiddleware(httpRequest) as HttpRequest<TController>;

            if (options.parseBody) {
                httpRequest = {
                    ...httpRequest,
                    body: await options.parseBody(request),
                };
            }

            const { statusCode, data } = await options.make().handle(httpRequest);
            return NextResponse.json(data, { status: statusCode });
        } catch (error) {
            return NextResponse.json(
                { message: getErrorMessage(error) },
                { status: getErrorStatusCode(error) },
            );
        }
    };
}
