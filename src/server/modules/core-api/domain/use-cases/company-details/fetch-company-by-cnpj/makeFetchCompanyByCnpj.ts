import { CompanyDetailsProvider } from "@/server/shared/infra/providers/cnpj/company-details-provider";
import { FetchCompanyByCnpj } from "./FetchCompanyByCnpj";
import { FetchCompanyByCnpjController } from "./FetchCompanyByCnpjController";

export function makeFetchCompanyByCnpj(): FetchCompanyByCnpjController {
    const useCase = new FetchCompanyByCnpj(CompanyDetailsProvider);
    return new FetchCompanyByCnpjController(useCase);
}
