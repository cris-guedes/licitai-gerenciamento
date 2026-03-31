import { ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ConformidadeInstrumentoModalidadeAmparoProvider extends ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService { }

export namespace ConformidadeInstrumentoModalidadeAmparoProvider {
    export type Params<M extends MethodKeys<typeof ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService>> = ServiceParams<typeof ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService, M>;
    export type Response<M extends MethodKeys<typeof ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService>> = ServiceResponse<typeof ConformidadeInstrumentoConvocatRioModalidadeDeContrataOEAmparoLegalService, M>;
}
