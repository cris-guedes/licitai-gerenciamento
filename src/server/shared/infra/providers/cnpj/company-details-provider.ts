import { OpenCnpjService } from "@/server/shared/lib/opencnpj";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class CompanyDetailsProvider extends OpenCnpjService { }

export namespace CompanyDetailsProvider {
    export type Params<M extends MethodKeys<typeof OpenCnpjService>> = ServiceParams<typeof OpenCnpjService, M>;
    export type Response<M extends MethodKeys<typeof OpenCnpjService>> = ServiceResponse<typeof OpenCnpjService, M>;
}
