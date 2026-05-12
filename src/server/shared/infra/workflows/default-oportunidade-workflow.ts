type WorkflowDefinitionSeed = {
    name: string;
    slug: string;
    metadata: Record<string, unknown>;
    nodeKinds: WorkflowNodeKindSeed[];
    nodes: WorkflowNodeSeed[];
    transitions: WorkflowTransitionSeed[];
};

type WorkflowNodeKindSeed = {
    key: string;
    label: string;
    description?: string;
    order: number;
    parentKindKey?: string;
    color?: string;
    metadata?: Record<string, unknown>;
};

type WorkflowNodeSeed = {
    kindKey: string;
    key: string;
    label: string;
    parentPath?: string;
    order: number;
    description?: string;
    color?: string;
    isInitial?: boolean;
    isTerminal?: boolean;
    metadata?: Record<string, unknown>;
};

type WorkflowTransitionSeed = {
    fromPath: string;
    toPath: string;
    transitionType?: string;
    metadata?: Record<string, unknown>;
};

const phasePath = (key: string) => `phase:${key}`;
const statusPath = (phaseKey: string, statusKey: string) => `${phasePath(phaseKey)}/status:${statusKey}`;
const situationPath = (phaseKey: string, statusKey: string, situationKey: string) =>
    `${statusPath(phaseKey, statusKey)}/situation:${situationKey}`;

export function buildDefaultOportunidadeWorkflowDefinition(): WorkflowDefinitionSeed {
    return {
        name: "Workflow padrão de oportunidades",
        slug: "workflow-padrao-oportunidades",
        metadata: {
            boardColumnKindKey: "phase",
            primaryBadgeKindKey: "status",
            secondaryBadgeKindKey: "situation",
        },
        nodeKinds: [
            {
                key: "phase",
                label: "Fase",
                description: "Macroetapa do acompanhamento da oportunidade.",
                order: 1,
                color: "#22c55e",
            },
            {
                key: "status",
                label: "Status",
                description: "Andamento principal dentro da fase.",
                order: 2,
                parentKindKey: "phase",
                color: "#3b82f6",
            },
            {
                key: "situation",
                label: "Situação",
                description: "Contexto específico do status atual.",
                order: 3,
                parentKindKey: "status",
                color: "#f8fafc",
            },
        ],
        nodes: [
            { kindKey: "phase", key: "analise_documental", label: "Análise documental", order: 1, isInitial: true, color: "#22c55e" },
            { kindKey: "status", key: "na_fila", label: "Na fila", parentPath: phasePath("analise_documental"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "status", key: "em_analise", label: "Em análise", parentPath: phasePath("analise_documental"), order: 2, color: "#3b82f6" },
            { kindKey: "status", key: "impugnar_edital", label: "Impugnar edital", parentPath: phasePath("analise_documental"), order: 3, color: "#3b82f6" },
            { kindKey: "situation", key: "novo_edital_reabertura_pregao", label: "Novo edital / reabertura do pregão", parentPath: statusPath("analise_documental", "impugnar_edital"), order: 1 },
            { kindKey: "situation", key: "impugnacao_aceita", label: "Impugnação aceita", parentPath: statusPath("analise_documental", "impugnar_edital"), order: 2 },
            { kindKey: "situation", key: "impugnacao_recusada", label: "Impugnação recusada", parentPath: statusPath("analise_documental", "impugnar_edital"), order: 3 },
            { kindKey: "situation", key: "retorna_para_analise", label: "Retorna para análise", parentPath: statusPath("analise_documental", "impugnar_edital"), order: 4 },

            { kindKey: "phase", key: "enviar_para_esclarecimento", label: "Enviar para esclarecimento", order: 2, color: "#22c55e" },
            { kindKey: "status", key: "esclarecimento", label: "Esclarecimento", parentPath: phasePath("enviar_para_esclarecimento"), order: 1, isInitial: true, color: "#3b82f6" },

            { kindKey: "phase", key: "aguardando_resposta", label: "Aguardando resposta", order: 3, color: "#22c55e" },
            { kindKey: "status", key: "esclarecimento", label: "Esclarecimento", parentPath: phasePath("aguardando_resposta"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "status", key: "descartado", label: "Descartado", parentPath: phasePath("aguardando_resposta"), order: 2, isTerminal: true, color: "#3b82f6" },
            { kindKey: "situation", key: "respondido", label: "Respondido", parentPath: statusPath("aguardando_resposta", "esclarecimento"), order: 1, isInitial: true },
            { kindKey: "situation", key: "produto_atendido", label: "Produto atendido", parentPath: statusPath("aguardando_resposta", "esclarecimento"), order: 2 },
            { kindKey: "situation", key: "produto_nao_atendido", label: "Produto não atendido", parentPath: statusPath("aguardando_resposta", "esclarecimento"), order: 3 },

            { kindKey: "phase", key: "precificacao", label: "Precificação", order: 4, color: "#22c55e" },
            { kindKey: "status", key: "proposta_enviada", label: "Proposta enviada", parentPath: phasePath("precificacao"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "situation", key: "cadastrar_proposta", label: "Cadastrar proposta", parentPath: statusPath("precificacao", "proposta_enviada"), order: 1, isInitial: true },
            { kindKey: "situation", key: "aguardar_abertura_pregao", label: "Aguardar abertura do pregão", parentPath: statusPath("precificacao", "proposta_enviada"), order: 2 },

            { kindKey: "phase", key: "fase_de_lances", label: "Fase de lances", order: 5, color: "#22c55e" },
            { kindKey: "status", key: "em_disputa", label: "Em disputa", parentPath: phasePath("fase_de_lances"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "status", key: "pregao_perdido", label: "Pregão perdido", parentPath: phasePath("fase_de_lances"), order: 2, isTerminal: true, color: "#3b82f6" },
            { kindKey: "status", key: "pregao_ganho", label: "Pregão ganho", parentPath: phasePath("fase_de_lances"), order: 3, color: "#3b82f6" },

            { kindKey: "phase", key: "pregao_suspenso", label: "Pregão suspenso", order: 6, color: "#22c55e" },
            { kindKey: "status", key: "pregao_suspenso", label: "Pregão suspenso", parentPath: phasePath("pregao_suspenso"), order: 1, isInitial: true, color: "#3b82f6" },

            { kindKey: "phase", key: "ganho", label: "Ganho", order: 7, color: "#22c55e" },
            { kindKey: "status", key: "ganho", label: "Ganho", parentPath: phasePath("ganho"), order: 1, isInitial: true, color: "#3b82f6" },

            { kindKey: "phase", key: "em_habilitacao", label: "Em habilitação", order: 8, color: "#22c55e" },
            { kindKey: "status", key: "habilitado", label: "Habilitado", parentPath: phasePath("em_habilitacao"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "situation", key: "aguardar_habilitacao", label: "Aguardar habilitação", parentPath: statusPath("em_habilitacao", "habilitado"), order: 1, isInitial: true },
            { kindKey: "situation", key: "aceita", label: "Aceita", parentPath: statusPath("em_habilitacao", "habilitado"), order: 2 },
            { kindKey: "situation", key: "recusada", label: "Recusada", parentPath: statusPath("em_habilitacao", "habilitado"), order: 3 },
            { kindKey: "situation", key: "proximo_concorrente", label: "Próximo concorrente", parentPath: statusPath("em_habilitacao", "habilitado"), order: 4 },

            { kindKey: "phase", key: "recurso", label: "Recurso", order: 9, color: "#22c55e" },
            { kindKey: "status", key: "recurso", label: "Recurso", parentPath: phasePath("recurso"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "status", key: "perdida", label: "Perdida", parentPath: phasePath("recurso"), order: 2, isTerminal: true, color: "#3b82f6" },
            { kindKey: "situation", key: "enviar_para_possivel_recurso", label: "Enviar para possível recurso", parentPath: statusPath("recurso", "recurso"), order: 1, isInitial: true },
            { kindKey: "situation", key: "recurso_aceito", label: "Recurso aceito", parentPath: statusPath("recurso", "recurso"), order: 2 },
            { kindKey: "situation", key: "recurso_nao_aceito", label: "Recurso não aceito", parentPath: statusPath("recurso", "recurso"), order: 3 },

            { kindKey: "phase", key: "contrarrazao", label: "Contrarrazão", order: 10, color: "#22c55e" },
            { kindKey: "status", key: "contrarrazao", label: "Contrarrazão", parentPath: phasePath("contrarrazao"), order: 1, isInitial: true, color: "#3b82f6" },

            { kindKey: "phase", key: "aguardando_contrato_ata", label: "Aguardando contrato/ata", order: 11, color: "#22c55e" },
            { kindKey: "status", key: "adjudicacao", label: "Adjudicação", parentPath: phasePath("aguardando_contrato_ata"), order: 1, isInitial: true, color: "#3b82f6" },
            { kindKey: "status", key: "homologado", label: "Homologado", parentPath: phasePath("aguardando_contrato_ata"), order: 2, color: "#3b82f6" },
            { kindKey: "status", key: "finalizado", label: "Finalizado", parentPath: phasePath("aguardando_contrato_ata"), order: 3, color: "#3b82f6" },

            { kindKey: "phase", key: "enviar_para_contrato", label: "Enviar para contrato", order: 12, color: "#22c55e" },
            { kindKey: "status", key: "enviar_para_contrato", label: "\"Enviar para Contrato\"", parentPath: phasePath("enviar_para_contrato"), order: 1, isInitial: true, isTerminal: true, color: "#3b82f6" },
        ],
        transitions: [
            { fromPath: phasePath("analise_documental"), toPath: phasePath("enviar_para_esclarecimento"), transitionType: "advance" },
            { fromPath: phasePath("enviar_para_esclarecimento"), toPath: phasePath("aguardando_resposta"), transitionType: "advance" },
            { fromPath: phasePath("aguardando_resposta"), toPath: phasePath("precificacao"), transitionType: "advance" },
            { fromPath: phasePath("precificacao"), toPath: phasePath("fase_de_lances"), transitionType: "advance" },
            { fromPath: phasePath("fase_de_lances"), toPath: phasePath("pregao_suspenso"), transitionType: "pause" },
            { fromPath: phasePath("pregao_suspenso"), toPath: phasePath("fase_de_lances"), transitionType: "resume" },
            { fromPath: phasePath("pregao_suspenso"), toPath: phasePath("ganho"), transitionType: "advance" },
            { fromPath: phasePath("fase_de_lances"), toPath: phasePath("ganho"), transitionType: "win" },
            { fromPath: phasePath("ganho"), toPath: phasePath("em_habilitacao"), transitionType: "advance" },
            { fromPath: phasePath("em_habilitacao"), toPath: phasePath("recurso"), transitionType: "appeal" },
            { fromPath: phasePath("em_habilitacao"), toPath: phasePath("aguardando_contrato_ata"), transitionType: "advance" },
            { fromPath: phasePath("recurso"), toPath: phasePath("contrarrazao"), transitionType: "advance" },
            { fromPath: phasePath("contrarrazao"), toPath: phasePath("aguardando_contrato_ata"), transitionType: "advance" },
            { fromPath: phasePath("aguardando_contrato_ata"), toPath: phasePath("enviar_para_contrato"), transitionType: "advance" },
            { fromPath: statusPath("analise_documental", "na_fila"), toPath: statusPath("analise_documental", "em_analise"), transitionType: "advance" },
            { fromPath: statusPath("analise_documental", "em_analise"), toPath: statusPath("analise_documental", "impugnar_edital"), transitionType: "branch" },
            { fromPath: statusPath("analise_documental", "impugnar_edital"), toPath: situationPath("analise_documental", "impugnar_edital", "impugnacao_aceita"), transitionType: "decision" },
            { fromPath: statusPath("analise_documental", "impugnar_edital"), toPath: situationPath("analise_documental", "impugnar_edital", "impugnacao_recusada"), transitionType: "decision" },
            { fromPath: situationPath("analise_documental", "impugnar_edital", "impugnacao_aceita"), toPath: situationPath("analise_documental", "impugnar_edital", "retorna_para_analise"), transitionType: "follow_up" },
            { fromPath: situationPath("analise_documental", "impugnar_edital", "retorna_para_analise"), toPath: statusPath("analise_documental", "em_analise"), transitionType: "reopen" },
            { fromPath: statusPath("analise_documental", "em_analise"), toPath: statusPath("aguardando_resposta", "esclarecimento"), transitionType: "advance" },
            { fromPath: statusPath("aguardando_resposta", "esclarecimento"), toPath: situationPath("aguardando_resposta", "esclarecimento", "respondido"), transitionType: "advance" },
            { fromPath: situationPath("aguardando_resposta", "esclarecimento", "respondido"), toPath: situationPath("aguardando_resposta", "esclarecimento", "produto_atendido"), transitionType: "decision" },
            { fromPath: situationPath("aguardando_resposta", "esclarecimento", "respondido"), toPath: situationPath("aguardando_resposta", "esclarecimento", "produto_nao_atendido"), transitionType: "decision" },
            { fromPath: situationPath("aguardando_resposta", "esclarecimento", "produto_atendido"), toPath: statusPath("precificacao", "proposta_enviada"), transitionType: "advance" },
            { fromPath: situationPath("aguardando_resposta", "esclarecimento", "produto_nao_atendido"), toPath: statusPath("aguardando_resposta", "descartado"), transitionType: "close" },
            { fromPath: statusPath("precificacao", "proposta_enviada"), toPath: situationPath("precificacao", "proposta_enviada", "aguardar_abertura_pregao"), transitionType: "advance" },
            { fromPath: situationPath("precificacao", "proposta_enviada", "aguardar_abertura_pregao"), toPath: statusPath("fase_de_lances", "em_disputa"), transitionType: "advance" },
            { fromPath: statusPath("fase_de_lances", "em_disputa"), toPath: statusPath("pregao_suspenso", "pregao_suspenso"), transitionType: "pause" },
            { fromPath: statusPath("pregao_suspenso", "pregao_suspenso"), toPath: statusPath("fase_de_lances", "em_disputa"), transitionType: "resume" },
            { fromPath: statusPath("fase_de_lances", "em_disputa"), toPath: statusPath("fase_de_lances", "pregao_perdido"), transitionType: "lose" },
            { fromPath: statusPath("fase_de_lances", "em_disputa"), toPath: statusPath("fase_de_lances", "pregao_ganho"), transitionType: "win" },
            { fromPath: statusPath("fase_de_lances", "pregao_ganho"), toPath: statusPath("ganho", "ganho"), transitionType: "advance" },
            { fromPath: statusPath("ganho", "ganho"), toPath: statusPath("em_habilitacao", "habilitado"), transitionType: "advance" },
            { fromPath: statusPath("em_habilitacao", "habilitado"), toPath: situationPath("em_habilitacao", "habilitado", "aceita"), transitionType: "decision" },
            { fromPath: statusPath("em_habilitacao", "habilitado"), toPath: situationPath("em_habilitacao", "habilitado", "recusada"), transitionType: "decision" },
            { fromPath: statusPath("em_habilitacao", "habilitado"), toPath: situationPath("em_habilitacao", "habilitado", "aguardar_habilitacao"), transitionType: "hold" },
            { fromPath: situationPath("em_habilitacao", "habilitado", "aguardar_habilitacao"), toPath: situationPath("em_habilitacao", "habilitado", "proximo_concorrente"), transitionType: "branch" },
            { fromPath: situationPath("em_habilitacao", "habilitado", "recusada"), toPath: statusPath("recurso", "recurso"), transitionType: "advance" },
            { fromPath: statusPath("recurso", "recurso"), toPath: situationPath("recurso", "recurso", "enviar_para_possivel_recurso"), transitionType: "advance" },
            { fromPath: situationPath("recurso", "recurso", "enviar_para_possivel_recurso"), toPath: situationPath("recurso", "recurso", "recurso_aceito"), transitionType: "decision" },
            { fromPath: situationPath("recurso", "recurso", "enviar_para_possivel_recurso"), toPath: situationPath("recurso", "recurso", "recurso_nao_aceito"), transitionType: "decision" },
            { fromPath: situationPath("recurso", "recurso", "recurso_aceito"), toPath: statusPath("contrarrazao", "contrarrazao"), transitionType: "advance" },
            { fromPath: statusPath("contrarrazao", "contrarrazao"), toPath: statusPath("aguardando_contrato_ata", "adjudicacao"), transitionType: "advance" },
            { fromPath: situationPath("em_habilitacao", "habilitado", "aceita"), toPath: statusPath("aguardando_contrato_ata", "adjudicacao"), transitionType: "advance" },
            { fromPath: statusPath("aguardando_contrato_ata", "adjudicacao"), toPath: statusPath("aguardando_contrato_ata", "homologado"), transitionType: "advance" },
            { fromPath: statusPath("aguardando_contrato_ata", "homologado"), toPath: statusPath("aguardando_contrato_ata", "finalizado"), transitionType: "advance" },
            { fromPath: statusPath("aguardando_contrato_ata", "finalizado"), toPath: statusPath("enviar_para_contrato", "enviar_para_contrato"), transitionType: "advance" },
            { fromPath: statusPath("fase_de_lances", "pregao_perdido"), toPath: statusPath("recurso", "perdida"), transitionType: "close" },
            { fromPath: situationPath("recurso", "recurso", "recurso_nao_aceito"), toPath: statusPath("recurso", "perdida"), transitionType: "close" },
        ],
    };
}
