import { ContratoEmpenhoService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ContratoEmpenhoProvider extends ContratoEmpenhoService { }

export namespace ContratoEmpenhoProvider {
    export type Params<M extends MethodKeys<typeof ContratoEmpenhoService>> = ServiceParams<typeof ContratoEmpenhoService, M>;
    export type Response<M extends MethodKeys<typeof ContratoEmpenhoService>> = ServiceResponse<typeof ContratoEmpenhoService, M>;
}
