
import { CompanyDetailsProvider } from "@/server/shared/infra/providers/cnpj/company-details-provider";
import type { FetchCompanyByCnpjDTO } from "./dtos/FetchCompanyByCnpjDTOs";
import { FetchCompanyByCnpjMapper, type FetchCompanyByCnpjView } from "./dtos/FetchCompanyByCnpjView";

export class FetchCompanyByCnpj {
    constructor(private readonly provider: typeof CompanyDetailsProvider) { }

    async execute(params: FetchCompanyByCnpj.Params): Promise<FetchCompanyByCnpj.Response> {
        const result = await this.provider.consultarCnpj(params);
        return FetchCompanyByCnpjMapper.toView(result);
    }
}

export namespace FetchCompanyByCnpj {
    export type Params = FetchCompanyByCnpjDTO;
    export type Response = FetchCompanyByCnpjView;
}
