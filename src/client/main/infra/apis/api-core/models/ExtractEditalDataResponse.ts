export type AnaliseCriticaItem = {
    numero:               number;
    produto:              string;
    quantidade:           number;
    marca:                string;
    modelo:               string;
    fornecedor:           string;
    ncm:                  string;
    valorReferencia:      number;
    valorReferenciaTotal: number;
    precoCusto:           number;
    precoMinimo:          number;
};

export type AnaliseCriticaEdital = {
    orgao:                    string;
    uasg:                     string;
    dataAbertura:             string;
    ambito:                   string;
    cadastro:                 string;
    abertura:                 string;
    uf:                       string;
    modoDisputa:              string;
    cidade:                   string;
    empresas:                 string[];
    analista:                 string;
    tipoDeLance:              string;
    numeroEdital:             string;
    intervaloLances:          string;
    numeroProcesso:           string;
    criterioJulgamento:       string;
    plataforma:               string;
    eppMe:                    string;
    adesao:                   string;
    modalidade:               string;
    regionalidade:            string;
    esclarecimentoImpugnacao: string;
    difal:                    string;
    prazoEnvioProposta:       string;
    obs:                      string;
    itens:                    AnaliseCriticaItem[];
    prazoEntrega:             string;
    tipoEntrega:              "centralizada" | "descentralizada" | "nao_especifica";
    tipoGarantia:             "on-site" | "balcao" | "nao_especifica";
    instalacao:               "fornecedor" | "comprador" | "nao_especifica";
    validadeProposta:         string;
    garantia:                 string;
    prazoAceite:              string;
    prazoPagamento:           string;
    documentacoes: {
        cnpj:                       boolean;
        outrosDocumentos:           string;
        inscricaoEstadual:          boolean;
        certidaoFgts:               boolean;
        certidaoTributosFederais:   boolean;
        certidaoTributosEstaduais:  boolean;
        certidaoTributosMunicipais: boolean;
        certidaoTrabalhista:        boolean;
        certidaoFalenciaRecuperacao: boolean;
        contratoSocial:             boolean;
        docSocios:                  boolean;
        balancos:                   boolean;
        atestado:                   boolean;
        alvara:                     boolean;
        certidaoJunta:              boolean;
        certidaoUnificadaCgu:       boolean;
        inscricaoMunicipal:         boolean;
        garantiaProposta:           boolean;
    };
    observacoes: string;
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
    sessionId:      string;
    mdContent:      string;
    analiseCritica: AnaliseCriticaEdital;
    metrics:        ExtractEditalDataMetrics;
};
