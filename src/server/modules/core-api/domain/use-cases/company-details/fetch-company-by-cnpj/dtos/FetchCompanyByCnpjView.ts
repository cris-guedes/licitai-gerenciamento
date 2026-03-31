import type { CompanyDetailsProvider } from "@/server/shared/infra/providers/cnpj/company-details-provider";

export type FetchCompanyByCnpjView = CompanyDetailsProvider.Response<"consultarCnpj">;

export class FetchCompanyByCnpjMapper {
    static toView(data: FetchCompanyByCnpjView): FetchCompanyByCnpjView {
        return data;
    }
}
