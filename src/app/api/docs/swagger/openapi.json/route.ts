import { NextResponse } from "next/server";
import { generateOpenApiSpec } from "@/server/modules/core-api/main/configs/openapi";

export async function GET() {
  const spec = generateOpenApiSpec();
  return NextResponse.json(spec);
}
