import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../../company/_shared/assertCompanyAccess";
import type { AiProvider, EditalExtraction } from "@/server/shared/infra/providers/ai/AiProvider";
import type { PdfProvider } from "@/server/shared/infra/providers/pdf/PdfProvider";

export class ExtractEdital {
    constructor(
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly aiProvider: AiProvider,
        private readonly pdfProvider: PdfProvider,
    ) {}

    async execute(params: ExtractEdital.Params): Promise<ExtractEdital.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.orgId,
        });

        let text: string;
        if (params.fileBuffer) {
            text = await this.pdfProvider.extractText(params.fileBuffer);
        } else if (params.url) {
            text = await this.pdfProvider.extractTextFromUrl(params.url);
        } else {
            throw new Error("Provide either a URL or a file.");
        }

        return this.aiProvider.extractEdital(text);
    }
}

export namespace ExtractEdital {
    export type Params = {
        userId: string;
        orgId: string;
        url?: string;
        fileBuffer?: Buffer;
    };
    export type Response = EditalExtraction;
}
