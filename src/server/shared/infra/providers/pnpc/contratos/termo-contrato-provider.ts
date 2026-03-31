import { TermoDeContratoService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class TermoContratoProvider extends TermoDeContratoService { }

export namespace TermoContratoProvider {
    export type Params<M extends MethodKeys<typeof TermoDeContratoService>> = ServiceParams<typeof TermoDeContratoService, M>;
    export type Response<M extends MethodKeys<typeof TermoDeContratoService>> = ServiceResponse<typeof TermoDeContratoService, M>;
}
