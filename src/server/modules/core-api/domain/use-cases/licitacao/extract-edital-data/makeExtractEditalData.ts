import { Pdf2MdFileParsingProvider } from "@/server/shared/infra/providers/file-parsing/pdf2md-file-parsing-provider";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import { MarkdownChunkingProvider } from "@/server/shared/infra/providers/chunking/markdown-chunking-provider";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/embeddings/flat-vector-store";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ChunkPostProcessing } from "@/server/shared/infra/providers/chunking/chunk-post-processing";
import { HttpDownloadProvider } from "@/server/shared/infra/providers/download/download-provider";
import { CryptoProvider } from "@/server/shared/infra/providers/crypto/crypto-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";
import { PdfReaderFileParsingProvider } from "@/server/shared/infra/providers/file-parsing/pdfreader-file-parsing-provider";

export function makeExtractEditalData(): ExtractEditalDataController {
    const fileParser = new PdfReaderFileParsingProvider();
    const chunker = new MarkdownChunkingProvider();
    const chunkPostProcessing = new ChunkPostProcessing();
    const embeddingProvider = new EmbeddingProvider();
    const vectorStore = new FlatVectorStore();
    const aiExtractor = new EditalExtractionProvider();
    const metricsProvider = new MetricsProvider();
    const sessionStorage = new ExtractionSessionProvider();
    const downloadProvider = new HttpDownloadProvider();
    const cryptoProvider = new CryptoProvider();
    const chunkSize = 1500;
    const chunkOverlap = 200;

    const useCase = new ExtractEditalData(
        fileParser,
        chunker,
        chunkPostProcessing,
        embeddingProvider,
        vectorStore,
        aiExtractor,
        metricsProvider,
        sessionStorage,
        downloadProvider,
        cryptoProvider,
        chunkSize,
        chunkOverlap
    );

    return new ExtractEditalDataController(useCase);
}
