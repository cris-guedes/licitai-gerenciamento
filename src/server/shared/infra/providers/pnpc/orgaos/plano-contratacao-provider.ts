import { PlanoDeContrataOService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class PlanoContratacaoProvider extends PlanoDeContrataOService { }

export namespace PlanoContratacaoProvider {
    export type Params<M extends MethodKeys<typeof PlanoDeContrataOService>> = ServiceParams<typeof PlanoDeContrataOService, M>;
    export type Response<M extends MethodKeys<typeof PlanoDeContrataOService>> = ServiceResponse<typeof PlanoDeContrataOService, M>;
}
