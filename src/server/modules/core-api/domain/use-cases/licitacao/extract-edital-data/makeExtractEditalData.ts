import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/file-parsing/document-handler-file-parsing-provider";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/embeddings/flat-vector-store";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { HttpDownloadProvider } from "@/server/shared/infra/providers/download/download-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";

export function makeExtractEditalData(): ExtractEditalDataController {
    const documentParser     = new DocumentHandlerFileParsingProvider();
    const embeddingProvider  = new EmbeddingProvider();
    const vectorStore        = new FlatVectorStore();
    const aiExtractor        = new EditalExtractionProvider();
    const metricsProvider    = new MetricsProvider();
    const sessionStorage     = new ExtractionSessionProvider();
    const downloadProvider   = new HttpDownloadProvider();

    const useCase = new ExtractEditalData(
        documentParser,
        embeddingProvider,
        vectorStore,
        aiExtractor,
        metricsProvider,
        sessionStorage,
        downloadProvider,
    );

    return new ExtractEditalDataController(useCase);
}
