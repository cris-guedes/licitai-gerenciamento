/**
 * Entidade: Oportunidade
 *
 * Representa a materialização interna de uma licitação que decidimos
 * acompanhar e gerenciar na plataforma.
 *
 * Ela não descreve o processo público em si. Esse papel pertence à
 * `Licitacao`. A oportunidade existe para ligar o processo oficial à
 * operação interna da empresa.
 *
 * O desenho desta entidade é intencionalmente enxuto e cobre apenas o que
 * precisamos hoje:
 * - empresa responsável
 * - licitação e edital vinculados
 * - usuário responsável
 * - status interno mínimo
 * - metadados transitórios do workspace
 */
export type Oportunidade = {
    /** Identificador interno da oportunidade. */
    id: string;

    /** Empresa da organização que está gerenciando esta oportunidade. */
    companyId: string;

    /** Processo licitatório oficial ao qual a oportunidade está vinculada. */
    licitacaoId: string | null;

    /** Edital base que está sendo utilizado na gestão atual. */
    editalId: string | null;

    /** Usuário responsável pela oportunidade dentro da operação. */
    responsavelUserId: string | null;

    /**
     * Estado interno mínimo da oportunidade.
     *
     * - `DRAFT`: oportunidade ainda em montagem / consumo do cadastro
     * - `ACTIVE`: oportunidade já consumada para gestão
     * - `CANCELLED`: oportunidade descartada ou encerrada internamente
     */
    status: OportunidadeStatus;

    /**
     * Espaço flexível para persistir dados transitórios do workspace sem
     * expandir o modelo cedo demais.
     *
     * Exemplos:
     * - preview humanizado
     * - estado parcial do formulário
     * - contexto temporário de navegação do workspace
     */
    metadata: Record<string, unknown> | null;

    createdAt: Date;
    updatedAt: Date;
};

export type OportunidadeStatus =
    | "DRAFT"
    | "ACTIVE"
    | "CANCELLED";
