import { FileParsingProvider } from "@/server/shared/infra/providers/file-parsing/file-parsing-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";

export function makeExtractEditalData(): ExtractEditalDataController {
    const fileParser = new FileParsingProvider();
    const useCase    = new ExtractEditalData(fileParser);
    return new ExtractEditalDataController(useCase);
}
