import { QdrantClient } from "@qdrant/js-client-rest";

export function createQdrantClient(options: { url?: string; apiKey?: string } = {}) {
    const qdrantUrl = options.url ?? process.env.QDRANT_URL ?? "http://localhost:6333";
    const isHttps = qdrantUrl.startsWith("https");
    const normalizedUrl = qdrantUrl.replace(/\/+$/, "");
    const parsed = new URL(normalizedUrl);
    const port = parsed.port ? Number(parsed.port) : (isHttps ? 443 : 6333);

    return new QdrantClient({
        host: parsed.hostname,
        port,
        https: isHttps,
        apiKey: options.apiKey ?? process.env.QDRANT_API_KEY,
        checkCompatibility: false,
    });
}
