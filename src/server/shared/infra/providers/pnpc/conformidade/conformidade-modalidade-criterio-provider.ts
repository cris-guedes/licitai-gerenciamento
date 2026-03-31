import { ConformidadeModalidadeECritRioDeJulgamentoService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ConformidadeModalidadeCriterioProvider extends ConformidadeModalidadeECritRioDeJulgamentoService { }

export namespace ConformidadeModalidadeCriterioProvider {
    export type Params<M extends MethodKeys<typeof ConformidadeModalidadeECritRioDeJulgamentoService>> = ServiceParams<typeof ConformidadeModalidadeECritRioDeJulgamentoService, M>;
    export type Response<M extends MethodKeys<typeof ConformidadeModalidadeECritRioDeJulgamentoService>> = ServiceResponse<typeof ConformidadeModalidadeECritRioDeJulgamentoService, M>;
}
