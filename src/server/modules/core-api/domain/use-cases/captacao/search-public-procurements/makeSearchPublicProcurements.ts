import { PncpSearchProvider } from "@/server/shared/infra/providers/pnpc/busca/pncp-search-provider";
import { SearchPublicProcurements } from "./SearchPublicProcurements";
import { SearchPublicProcurementsController } from "./SearchPublicProcurementsController";

export function makeSearchPublicProcurements(): SearchPublicProcurementsController {
    const useCase = new SearchPublicProcurements(PncpSearchProvider);
    return new SearchPublicProcurementsController(useCase);
}
