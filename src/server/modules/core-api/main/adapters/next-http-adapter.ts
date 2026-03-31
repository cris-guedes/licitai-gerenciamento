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

export function adaptNextRoute(config: RouteConfig) {
    return async (request: NextRequest): Promise<NextResponse> => {
        let httpRequest: HttpRequest = {
            body:    request.method === "POST" ? await request.json().catch(() => undefined) : undefined,
            query:   buildQueryParams(request.nextUrl.searchParams),
            params:  undefined,
            headers: Object.fromEntries(request.headers),
        };

        for (const handler of config.preHandlers ?? []) {
            httpRequest = await handler(httpRequest);
        }

        const { statusCode, data } = await config.make().handle(httpRequest);
        return NextResponse.json(data, { status: statusCode });
    };
}
