/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const ItemSolicitadoSchema = z.object({
    itemId: z.string(),
    quantidade: z.string(),
});

const OrgaoSchema = z.object({
    cnpj: z.string(),
    nome: z.string(),
    codigoUnidade: z.string(),
    nomeUnidade: z.string(),
    municipio: z.string(),
    uf: z.string(),
    esfera: z.string(),
    poder: z.string(),
    itensSolicitados: z.array(ItemSolicitadoSchema),
});

const ItemSchema = z.object({
    itemId: z.string(),
    numero: z.string(),
    descricao: z.string(),
    tipo: z.string(),
    lote: z.string(),
    quantidade: z.string(),
    unidadeMedida: z.string(),
    valorUnitarioEstimado: z.string(),
    valorTotal: z.string(),
    codigoNcmNbs: z.string(),
    descricaoNcmNbs: z.string(),
    codigoCatmatCatser: z.string(),
    criterioJulgamento: z.string(),
    beneficioTributario: z.string(),
    observacao: z.string(),
});

const HabilitacaoSchema = z.object({
    tipo: z.string(),
    categoria: z.string(),
    obrigatorio: z.string(),
});

const FinalizeOportunidadeRegistrationFormSchema = z.object({
    numeroLicitacao: z.string(),
    ano: z.string(),
    processo: z.string(),
    modalidade: z.string(),
    objeto: z.string(),
    orgaoGerenciador: OrgaoSchema,
    valorTotalEstimado: z.string(),
    valorTotalHomologado: z.string(),
    srp: z.string(),
    situacao: z.string(),
    dataPublicacao: z.string(),
    dataUltimaAtualizacao: z.string(),
    linkProcesso: z.string(),
    identificadorExterno: z.string(),
    edital: z.object({
        amparoLegal: z.string(),
        orgaosParticipantes: z.array(OrgaoSchema),
        cronograma: z.object({
            acolhimentoInicio: z.string(),
            acolhimentoFim: z.string(),
            horaLimite: z.string(),
            sessaoPublica: z.string(),
            horaSessaoPublica: z.string(),
            esclarecimentosAte: z.string(),
            impugnacaoAte: z.string(),
        }),
        certame: z.object({
            modoDisputa: z.string(),
            criterioJulgamento: z.string(),
            tipoLance: z.string(),
            intervaloLances: z.string(),
            duracaoSessaoMinutos: z.string(),
            exclusivoMeEpp: z.string(),
            permiteConsorcio: z.string(),
            exigeVisitaTecnica: z.string(),
            regionalidade: z.string(),
            permiteAdesao: z.string(),
            percentualAdesao: z.string(),
            vigenciaAtaMeses: z.string(),
            vigenciaContratoDias: z.string(),
            difal: z.string(),
        }),
        itens: z.array(ItemSchema),
        execucao: z.object({
            entrega: z.object({
                prazoEmDias: z.string(),
                localEntrega: z.string(),
                tipoEntrega: z.string(),
                responsavelInstalacao: z.string(),
            }),
            pagamento: z.object({
                prazoEmDias: z.string(),
            }),
            aceite: z.object({
                prazoEmDias: z.string(),
            }),
            validadeProposta: z.string(),
            garantia: z.object({
                tipo: z.string(),
                meses: z.string(),
                tempoAtendimentoHoras: z.string(),
            }),
        }),
        habilitacao: z.array(HabilitacaoSchema),
        informacaoComplementar: z.string(),
    }),
});

const FinalizeOportunidadeRegistrationBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().optional().describe("ID opcional da oportunidade em rascunho que será consumada."),
    form: FinalizeOportunidadeRegistrationFormSchema.describe("Payload do formulário de cadastro consolidado da licitação."),
});

const FinalizeOportunidadeRegistrationResponseSchema = z.object({
    oportunidadeId: z.string().describe("ID da oportunidade consumada."),
    oportunidadeStatus: z.enum(["ACTIVE"]).describe("Status final da oportunidade após a consumação."),
    licitacaoId: z.string().describe("ID da licitação oficial preenchida."),
    licitacaoStatus: z.enum(["COMPLETED"]).describe("Status técnico do cadastro da licitação após a conclusão."),
    editalId: z.string().describe("ID do edital preenchido com sua estrutura rica."),
    editalStatus: z.enum(["COMPLETED"]).describe("Status técnico do cadastro do edital após a conclusão."),
});

export namespace FinalizeOportunidadeRegistrationControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = FinalizeOportunidadeRegistrationBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = FinalizeOportunidadeRegistrationResponseSchema;

    export type Input = z.infer<typeof FinalizeOportunidadeRegistrationBodySchema>;
}
