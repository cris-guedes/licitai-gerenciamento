import {
    Controller,
    HttpRequest,
    HttpResponse,
    badRequest,
    ok,
    serverError,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalData } from "./ExtractEditalData";

// Body é populado pelo next-http-adapter ao parsear o multipart/form-data
interface ParsedMultipartBody {
    fileBuffer:   Buffer;
    fileFilename: string;
    fileSize:     number;
}

interface ExtractEditalDataControllerTypes {
    Body:     ParsedMultipartBody;
    Query:    undefined;
    Params:   undefined;
    Response: ExtractEditalData.Output;
}

export class ExtractEditalDataController
    implements Controller<ExtractEditalDataControllerTypes>
{
    constructor(private readonly useCase: ExtractEditalData) {}

    async handle(
        request: HttpRequest<ExtractEditalDataControllerTypes>,
    ): Promise<HttpResponse<ExtractEditalData.Output>> {
        try {
            const body = request.body as ParsedMultipartBody | undefined;
            if (!body?.fileBuffer) {
                return badRequest(new Error("Envie o edital como multipart/form-data com o campo 'file'."));
            }

            const result = await this.useCase.execute({ pdfBuffer: body.fileBuffer });
            return ok(result);
        } catch (error: any) {
            console.error(error?.stack ?? error);
            return serverError(error);
        }
    }
}

export namespace ExtractEditalDataController {
    export type Types    = ExtractEditalDataControllerTypes;
    export type Body     = ExtractEditalDataControllerTypes["Body"];
    export type Response = ExtractEditalDataControllerTypes["Response"];
}
