import { ModoDeDisputaService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ModoDeDisputaProvider extends ModoDeDisputaService { }

export namespace ModoDeDisputaProvider {
    export type Params<M extends MethodKeys<typeof ModoDeDisputaService>> = ServiceParams<typeof ModoDeDisputaService, M>;
    export type Response<M extends MethodKeys<typeof ModoDeDisputaService>> = ServiceResponse<typeof ModoDeDisputaService, M>;
}
