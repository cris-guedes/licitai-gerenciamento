/**
 * Shim de compatibilidade — re-exporta LocalEmbeddingProvider sob o nome legado.
 * Prefira importar diretamente de local-embedding-provider ou openai-embedding-provider.
 */
export { LocalEmbeddingProvider as EmbeddingProvider } from "./providers/local-embedding-provider";
export type { LocalEmbeddingProviderOptions as EmbeddingProviderOptions } from "./providers/local-embedding-provider";
export type { ChunkMetadata, EmbedInput, IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
