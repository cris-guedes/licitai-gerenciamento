import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env then .env.local (local overrides base)
config({ path: ".env" });
config({ path: ".env.local" });

export default defineConfig({
    schema: path.join("src", "server", "shared", "infra", "db", "schema.prisma"),
    datasource: {
        url: process.env.DATABASE_URL!,
    },
});
