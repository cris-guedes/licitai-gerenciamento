import { ContrataOService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ContratacaoProvider extends ContrataOService { }

export namespace ContratacaoProvider {
    export type Params<M extends MethodKeys<typeof ContrataOService>> = ServiceParams<typeof ContrataOService, M>;
    export type Response<M extends MethodKeys<typeof ContrataOService>> = ServiceResponse<typeof ContrataOService, M>;
}
