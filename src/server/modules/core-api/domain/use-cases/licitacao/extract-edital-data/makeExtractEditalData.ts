import { FileParsingProvider } from "@/server/shared/infra/providers/file-parsing/file-parsing-provider";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";

export function makeExtractEditalData(): ExtractEditalDataController {
    const fileParser  = new FileParsingProvider();
    const aiExtractor = new EditalExtractionProvider();
    const useCase     = new ExtractEditalData(fileParser, aiExtractor);
    return new ExtractEditalDataController(useCase);
}
