import { ConformidadeInstrumentoConvocatRioEModoDeDisputaService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ConformidadeInstrumentoModoDisputaProvider extends ConformidadeInstrumentoConvocatRioEModoDeDisputaService { }

export namespace ConformidadeInstrumentoModoDisputaProvider {
    export type Params<M extends MethodKeys<typeof ConformidadeInstrumentoConvocatRioEModoDeDisputaService>> = ServiceParams<typeof ConformidadeInstrumentoConvocatRioEModoDeDisputaService, M>;
    export type Response<M extends MethodKeys<typeof ConformidadeInstrumentoConvocatRioEModoDeDisputaService>> = ServiceResponse<typeof ConformidadeInstrumentoConvocatRioEModoDeDisputaService, M>;
}
