import { ConformidadeModalidadeEFonteOrAmentariaService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ConformidadeModalidadeFonteProvider extends ConformidadeModalidadeEFonteOrAmentariaService { }

export namespace ConformidadeModalidadeFonteProvider {
    export type Params<M extends MethodKeys<typeof ConformidadeModalidadeEFonteOrAmentariaService>> = ServiceParams<typeof ConformidadeModalidadeEFonteOrAmentariaService, M>;
    export type Response<M extends MethodKeys<typeof ConformidadeModalidadeEFonteOrAmentariaService>> = ServiceResponse<typeof ConformidadeModalidadeEFonteOrAmentariaService, M>;
}
