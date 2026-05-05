import { NextRequest, NextResponse } from "next/server";
import type { HttpRequest, RouteConfig } from "./http-adapter";

function coerceValue(v: string): unknown {
    if (/^\d+$/.test(v) && v.length <= 10) return Number(v);
    if (v === "true")  return true;
    if (v === "false") return false;
    return v;
}

/**
 * Build query params from URLSearchParams, preserving repeated keys as arrays.
 * Only converts "small" numeric strings (≤ 10 digits) to number to avoid
 * converting CNPJ (14 digits) and CPF (11 digits) identifiers to numbers.
 */
function buildQueryParams(searchParams: URLSearchParams): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const seen = new Set<string>();

    for (const [key] of searchParams.entries()) {
        if (seen.has(key)) continue;
        seen.add(key);

        const values = searchParams.getAll(key).map(coerceValue);
        result[key] = values.length === 1 ? values[0] : values;
    }
    return result;
}

async function parsePostBody(request: NextRequest): Promise<unknown> {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData().catch(() => null);
        if (!formData) return undefined;
        const result: Record<string, unknown> = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                result[`${key}Buffer`]   = Buffer.from(await value.arrayBuffer());
                result[`${key}Filename`] = value.name;
                result[`${key}MimeType`] = value.type;
                result[`${key}Size`]     = value.size;
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return request.json().catch(() => undefined);
}

function buildBaseHttpRequest(request: NextRequest): HttpRequest {
    return {
        body: undefined,
        query: buildQueryParams(request.nextUrl.searchParams),
        params: undefined,
        headers: Object.fromEntries(request.headers),
    };
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

export function adaptNextRoute(config: RouteConfig) {
    return async (request: NextRequest): Promise<NextResponse> => {
        try {
            let httpRequest = buildBaseHttpRequest(request);

            for (const handler of config.preHandlers ?? []) {
                httpRequest = await handler(httpRequest);
            }

            // Controllers de streaming retornam Response diretamente (ex: SSE)
            if (config.makeStream) {
                return config.makeStream().handleStream(request, httpRequest) as Promise<NextResponse>;
            }

            httpRequest = {
                ...httpRequest,
                body: request.method === "POST" ? await parsePostBody(request) : undefined,
            };

            const { statusCode, data } = await config.make!().handle(httpRequest);
            return NextResponse.json(data, { status: statusCode });
        } catch (error) {
            return NextResponse.json(
                { message: getErrorMessage(error) },
                { status: getErrorStatusCode(error) },
            );
        }
    };
}
