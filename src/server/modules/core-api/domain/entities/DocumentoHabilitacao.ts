/**
 * Entidade: DocumentoHabilitacao
 *
 * Representa um documento exigido do fornecedor para que ele possa
 * participar do processo licitatório.
 *
 * A habilitação é o conjunto de comprovações que o fornecedor precisa
 * apresentar para demonstrar que está apto jurídica, fiscal, técnica
 * e economicamente a contratar com o poder público.
 *
 * Categorias comuns de habilitação:
 * - Jurídica: contrato social, atos constitutivos
 * - Fiscal e Trabalhista: certidões de regularidade (FGTS, tributos, etc.)
 * - Técnica: atestados de capacidade técnica
 * - Econômico-financeira: balanços, certidão de falência
 */
export type DocumentoHabilitacao = {
    /**
     * Identificador semântico do tipo de documento exigido.
     * Usar snake_case descritivo.
     * Exemplos: "certidao_fgts", "certidao_tributos_federais",
     * "atestado_capacidade_tecnica", "certidao_falencia",
     * "contrato_social", "inscricao_estadual".
     */
    tipo: string;

    /**
     * Indica se a apresentação do documento é obrigatória para participação.
     * Documentos opcionais podem ser exigidos apenas em casos específicos.
     */
    obrigatorio: boolean;
};
