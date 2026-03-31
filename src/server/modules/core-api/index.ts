import { NextRequest, NextResponse } from "next/server";
import { adaptNextRoute }           from "./main/adapters/next-http-adapter";
import { allRoutes }                from "./main/configs/setup-routes";
import { UnauthorizedError }        from "@/server/shared/errors/unauthorized-error";

export async function httpHandler(
    request: NextRequest,
    context: { params: Promise<{ slug: string[] }> }
): Promise<NextResponse> {
    const { slug } = await context.params;
    const key      = slug.join("/");
    const config   = allRoutes[key as keyof typeof allRoutes];

    if (!config) {
        return NextResponse.json({ message: "Not found", path: key }, { status: 404 });
    }

    const expectedMethod = config.method ?? "GET";
    if (request.method !== expectedMethod) {
        return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
    }

    try {
        return await adaptNextRoute(config)(request);
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        throw error;
    }
}
