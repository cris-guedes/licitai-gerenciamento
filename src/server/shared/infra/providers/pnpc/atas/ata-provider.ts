import { AtaService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class AtaProvider extends AtaService { }

export namespace AtaProvider {
    export type Params<M extends MethodKeys<typeof AtaService>> = ServiceParams<typeof AtaService, M>;
    export type Response<M extends MethodKeys<typeof AtaService>> = ServiceResponse<typeof AtaService, M>;
}
