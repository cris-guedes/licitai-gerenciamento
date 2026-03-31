import { CritRioDeJulgamentoService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class CritRioDeJulgamentoProvider extends CritRioDeJulgamentoService { }

export namespace CritRioDeJulgamentoProvider {
    export type Params<M extends MethodKeys<typeof CritRioDeJulgamentoService>> = ServiceParams<typeof CritRioDeJulgamentoService, M>;
    export type Response<M extends MethodKeys<typeof CritRioDeJulgamentoService>> = ServiceResponse<typeof CritRioDeJulgamentoService, M>;
}
