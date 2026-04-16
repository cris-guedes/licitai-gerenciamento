import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { EmbeddingProvider }        from "@/server/shared/infra/providers/vector/embedding-provider";
import { FlatVectorStore }          from "@/server/shared/infra/providers/vector/flat-vector-store";
import { EditalIndexingService }    from "@/server/shared/infra/providers/extraction/edital-indexing-service";
import { EditalFieldExtractor }     from "@/server/shared/infra/providers/extraction/edital-field-extractor";
import { EditalItemExtractor }      from "@/server/shared/infra/providers/extraction/edital-item-extractor";
import { MetricsProvider }          from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ExtractEditalData }        from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";

export function makeExtractEditalData(): ExtractEditalDataController {
    const embeddingProvider = new EmbeddingProvider();
    const vectorStore       = new FlatVectorStore();
    const documentParser    = new DocumentHandlerFileParsingProvider();
    const indexingService   = new EditalIndexingService(embeddingProvider, vectorStore);
    const fieldExtractor    = new EditalFieldExtractor(embeddingProvider, vectorStore);
    const itemExtractor     = new EditalItemExtractor(embeddingProvider, vectorStore);
    const metricsProvider   = new MetricsProvider();
    const sessionStorage    = new ExtractionSessionProvider();

    const useCase = new ExtractEditalData(
        documentParser,
        indexingService,
        fieldExtractor,
        itemExtractor,
        metricsProvider,
        sessionStorage,
    );

    return new ExtractEditalDataController(useCase);
}
