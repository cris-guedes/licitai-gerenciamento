import type { RouteConfig } from "../adapters/http-adapter";
import { makeSearchPublicProcurements }            from "../../domain/use-cases/captacao/search-public-procurements/makeSearchPublicProcurements";
import { makeFetchExternalProcurementItems }       from "../../domain/use-cases/captacao/fetch-external-procurement-items/makeFetchExternalProcurementItems";
import { makeFetchExternalProcurementDetail }      from "../../domain/use-cases/captacao/fetch-external-procurement-detail/makeFetchExternalProcurementDetail";
import { makeFetchExternalProcurementFiles }       from "../../domain/use-cases/captacao/fetch-external-procurement-files/makeFetchExternalProcurementFiles";
import { makeFetchExternalProcurementAtas }        from "../../domain/use-cases/captacao/fetch-external-procurement-atas/makeFetchExternalProcurementAtas";
import { makeFetchExternalProcurementContracts }   from "../../domain/use-cases/captacao/fetch-external-procurement-contracts/makeFetchExternalProcurementContracts";
import { makeFetchExternalProcurementHistory }        from "../../domain/use-cases/captacao/fetch-external-procurement-history/makeFetchExternalProcurementHistory";
import { makeFetchExternalProcurementItemResults }    from "../../domain/use-cases/captacao/fetch-external-procurement-item-results/makeFetchExternalProcurementItemResults";
import { makeFetchExternalContractDetail }            from "../../domain/use-cases/captacao/fetch-external-contract-detail/makeFetchExternalContractDetail";
import { makeFetchExternalContractFiles }             from "../../domain/use-cases/captacao/fetch-external-contract-files/makeFetchExternalContractFiles";
import { makeFetchExternalContractHistory }           from "../../domain/use-cases/captacao/fetch-external-contract-history/makeFetchExternalContractHistory";
import { makeFetchExternalContractTerms }             from "../../domain/use-cases/captacao/fetch-external-contract-terms/makeFetchExternalContractTerms";
import { makeFetchExternalAtaDetail }                 from "../../domain/use-cases/captacao/fetch-external-ata-detail/makeFetchExternalAtaDetail";
import { makeFetchExternalAtaFiles }                  from "../../domain/use-cases/captacao/fetch-external-ata-files/makeFetchExternalAtaFiles";
import { makeFetchExternalAtaHistory }                from "../../domain/use-cases/captacao/fetch-external-ata-history/makeFetchExternalAtaHistory";

export const publicProcurementsRoutes: Record<string, RouteConfig> = {
    "search-public-procurements":             { make: makeSearchPublicProcurements },
    "fetch-external-procurement-items":       { make: makeFetchExternalProcurementItems,    method: "GET" },
    "fetch-external-procurement-detail":      { make: makeFetchExternalProcurementDetail,   method: "GET" },
    "fetch-external-procurement-files":       { make: makeFetchExternalProcurementFiles,    method: "GET" },
    "fetch-external-procurement-atas":        { make: makeFetchExternalProcurementAtas,     method: "GET" },
    "fetch-external-procurement-contracts":   { make: makeFetchExternalProcurementContracts, method: "GET" },
    "fetch-external-procurement-history":     { make: makeFetchExternalProcurementHistory,        method: "GET" },
    "fetch-external-procurement-item-results": { make: makeFetchExternalProcurementItemResults,   method: "GET" },
    "fetch-external-contract-detail":         { make: makeFetchExternalContractDetail,            method: "GET" },
    "fetch-external-contract-files":          { make: makeFetchExternalContractFiles,             method: "GET" },
    "fetch-external-contract-history":        { make: makeFetchExternalContractHistory,           method: "GET" },
    "fetch-external-contract-terms":          { make: makeFetchExternalContractTerms,             method: "GET" },
    "fetch-external-ata-detail":              { make: makeFetchExternalAtaDetail,                 method: "GET" },
    "fetch-external-ata-files":               { make: makeFetchExternalAtaFiles,                  method: "GET" },
    "fetch-external-ata-history":             { make: makeFetchExternalAtaHistory,                method: "GET" },
};
