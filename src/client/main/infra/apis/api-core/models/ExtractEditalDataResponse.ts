export type EditalItem = {
    numero:                  number;
    lote:                    string | null;
    descricao:               string;
    quantidade:              number;
    unidade:                 string;
    valor_unitario_estimado: number | null;
    valor_total_estimado:    number | null;
    ncm:                     string | null;
};

export type Edital = {
    numero:               string;
    numero_processo:      string;
    modalidade:           string;
    objeto_resumido:      string;
    valor_estimado_total: number | null;
    identificacao: {
        uasg:   string;
        portal: string;
    };
    classificacao: {
        ambito: string;
    };
    orgao_gerenciador: {
        nome:   string;
        cnpj:   string;
        uf:     string;
        cidade: string;
    };
    datas: {
        data_abertura:                  string | null;
        data_proposta_limite:           string | null;
        hora_proposta_limite:           string | null;
        data_esclarecimento_impugnacao: string | null;
        cadastro_inicio:                string | null;
        cadastro_fim:                   string | null;
    };
    disputa: {
        modo:                string;
        criterio_julgamento: string;
        tipo_lance:          string;
        intervalo_lances:    string | null;
    };
    regras: {
        exclusivo_me_epp:  boolean;
        permite_adesao:    boolean;
        percentual_adesao: number | null;
        regionalidade:     string | null;
        difal:             boolean;
    };
    logistica: {
        local_entrega:          string | null;
        tipo_entrega:           string;
        responsavel_instalacao: string;
    };
    prazos: {
        entrega:                { texto_original: string | null; dias_corridos: number | null };
        aceite:                 { texto_original: string | null; dias: number | null };
        pagamento:              { texto_original: string | null; dias: number | null };
        validade_proposta_dias: number | null;
    };
    garantia: {
        tipo:                    string;
        meses:                   number | null;
        tempo_atendimento_horas: number | null;
    };
    itens:               EditalItem[];
    orgaos_participantes: Array<{
        nome:  string;
        itens: Array<{ item_numero: number; quantidade: number }>;
    }>;
    documentos_exigidos: Array<{
        tipo:        string;
        obrigatorio: boolean;
    }>;
    observacoes: string | null;
};

export type ExtractionResult = {
    edital: Edital;
};

export type ExtractEditalDataMetrics = {
    sessionId:        string;
    timestamp:        string;
    pdfUrl:           string;
    pdfFileSizeBytes: number;
    conversionTimeMs: number;
    extractionTimeMs: number;
    totalTimeMs:      number;
    mdFileSizeBytes:  number;
    mdWordCount:      number;
    doclingFilename:  string;
    tempDir:          string;
    tokensUsed: {
        prompt:     number;
        completion: number;
        total:      number;
    };
};

export type ExtractEditalDataResponse = {
    sessionId:  string;
    mdContent:  string;
    extraction: ExtractionResult;
    metrics:    ExtractEditalDataMetrics;
};
