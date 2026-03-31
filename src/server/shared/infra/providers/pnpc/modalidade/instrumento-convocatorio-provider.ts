import { InstrumentoConvocatRioService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class InstrumentoConvocatRioProvider extends InstrumentoConvocatRioService { }

export namespace InstrumentoConvocatRioProvider {
    export type Params<M extends MethodKeys<typeof InstrumentoConvocatRioService>> = ServiceParams<typeof InstrumentoConvocatRioService, M>;
    export type Response<M extends MethodKeys<typeof InstrumentoConvocatRioService>> = ServiceResponse<typeof InstrumentoConvocatRioService, M>;
}
