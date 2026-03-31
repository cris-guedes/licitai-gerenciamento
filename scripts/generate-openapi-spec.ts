import fs from "fs";
import path from "path";
import { generateOpenApiSpec } from "@/server/modules/core-api/main/configs/openapi";

const outputPath = path.resolve(process.cwd(), "openapi.generated.json");

const spec = generateOpenApiSpec();
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

console.log(`✅ OpenAPI spec gerado em: ${outputPath}`);
