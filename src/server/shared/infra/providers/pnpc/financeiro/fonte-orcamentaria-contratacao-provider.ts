import { FonteOrAmentRiaDaContrataOService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class FonteOrcamentariaContratacaoProvider extends FonteOrAmentRiaDaContrataOService { }

export namespace FonteOrcamentariaContratacaoProvider {
    export type Params<M extends MethodKeys<typeof FonteOrAmentRiaDaContrataOService>> = ServiceParams<typeof FonteOrAmentRiaDaContrataOService, M>;
    export type Response<M extends MethodKeys<typeof FonteOrAmentRiaDaContrataOService>> = ServiceResponse<typeof FonteOrAmentRiaDaContrataOService, M>;
}
