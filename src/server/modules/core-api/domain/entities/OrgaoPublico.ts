/**
 * Entidade: OrgaoPublico
 *
 * Representa qualquer órgão ou entidade pública envolvida em um processo
 * licitatório — seja o órgão que conduz a licitação (gerenciador) ou um
 * órgão que adere a ela (participante).
 *
 * Não carrega nenhuma referência a sistemas externos (PNCP, UASG, etc.).
 * Esses mapeamentos pertencem à camada de infraestrutura.
 */
export type OrgaoPublico = {
    /** CNPJ do órgão (somente dígitos ou formatado) */
    cnpj: string | null;

    /** Nome oficial / razão social */
    nome: string | null;

    /** Código da unidade gestora dentro do órgão (ex: UASG) */
    codigoUnidade: string | null;

    /** Nome da unidade gestora */
    nomeUnidade: string | null;

    /** Município sede */
    municipio: string | null;

    /** Unidade Federativa (sigla, ex: "MT") */
    uf: string | null;

    /**
     * Esfera de governo.
     * Define o nível de governo ao qual o órgão pertence.
     */
    esfera: "federal" | "estadual" | "municipal" | null;

    /**
     * Poder ao qual o órgão está vinculado.
     */
    poder: "executivo" | "legislativo" | "judiciario" | null;

    /**
     * Itens solicitados pelo órgão participante (SRP).
     * Presente apenas em órgãos participantes de atas de registro de preços.
     */
    itensSolicitados: { itemNumero: number; quantidade: number }[] | null;

    /**
     * Trecho original do edital de onde os dados do órgão foram extraídos.
     * Serve como evidência para auditoria.
     */
    textoOriginal: string | null;
};
