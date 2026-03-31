import { TipoDeInstrumentoDeCobranAService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class TipoDeInstrumentoDeCobranAProvider extends TipoDeInstrumentoDeCobranAService { }

export namespace TipoDeInstrumentoDeCobranAProvider {
    export type Params<M extends MethodKeys<typeof TipoDeInstrumentoDeCobranAService>> = ServiceParams<typeof TipoDeInstrumentoDeCobranAService, M>;
    export type Response<M extends MethodKeys<typeof TipoDeInstrumentoDeCobranAService>> = ServiceResponse<typeof TipoDeInstrumentoDeCobranAService, M>;
}
