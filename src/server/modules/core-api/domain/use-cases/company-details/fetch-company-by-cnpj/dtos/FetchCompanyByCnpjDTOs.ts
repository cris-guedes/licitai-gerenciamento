import type { CompanyDetailsProvider } from "@/server/shared/infra/providers/cnpj/company-details-provider";

export type FetchCompanyByCnpjDTO = CompanyDetailsProvider.Params<"consultarCnpj">;
