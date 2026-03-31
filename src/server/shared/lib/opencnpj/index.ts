export interface CnaeSecundario {
    codigo:   number;
    descricao: string;
}

export interface CompanyDetails {
    cnpj:                    string;
    razao_social:            string;
    nome_fantasia:           string | null;
    situacao_cadastral:      string;
    data_situacao_cadastral: string;
    data_abertura:           string;
    porte:                   string;
    natureza_juridica:       string;
    cnae_fiscal:             number;
    cnae_fiscal_descricao:   string;
    cnaes_secundarios:       CnaeSecundario[];
    logradouro:              string;
    numero:                  string;
    complemento:             string | null;
    bairro:                  string;
    municipio:               string;
    uf:                      string;
    cep:                     string;
    telefone_1:              string | null;
    email:                   string | null;
    capital_social:          number;
    opcao_pelo_simples:      boolean | null;
    opcao_pelo_mei:          boolean | null;
}

interface BrasilApiCnaeSecundario {
    codigo:   number;
    descricao: string;
}

interface BrasilApiResponse {
    cnpj:                         string;
    razao_social:                 string;
    nome_fantasia:                string | null;
    descricao_situacao_cadastral: string;
    data_situacao_cadastral:      string;
    data_inicio_atividade:        string;
    descricao_porte:              string;
    natureza_juridica:            string;
    cnae_fiscal:                  number;
    cnae_fiscal_descricao:        string;
    cnaes_secundarios:            BrasilApiCnaeSecundario[];
    logradouro:                   string;
    numero:                       string;
    complemento:                  string | null;
    bairro:                       string;
    municipio:                    string;
    uf:                           string;
    cep:                          string;
    ddd_telefone_1:               string | null;
    email:                        string | null;
    capital_social:               number;
    opcao_pelo_simples:           boolean | null;
    opcao_pelo_mei:               boolean | null;
}

const BASE_URL = "https://brasilapi.com.br/api/cnpj/v1";

export class OpenCnpjService {
    static async consultarCnpj({ cnpj }: { cnpj: string }): Promise<CompanyDetails> {
        const sanitized = cnpj.replace(/\D/g, "");
        const response = await fetch(`${BASE_URL}/${sanitized}`, {
            headers: { "User-Agent": "licitai/1.0" },
        });

        if (!response.ok) {
            throw new Error(`OpenCNPJ API error: ${response.status} ${response.statusText}`);
        }

        const data: BrasilApiResponse = await response.json();

        return {
            cnpj:                    data.cnpj,
            razao_social:            data.razao_social,
            nome_fantasia:           data.nome_fantasia || null,
            situacao_cadastral:      data.descricao_situacao_cadastral,
            data_situacao_cadastral: data.data_situacao_cadastral,
            data_abertura:           data.data_inicio_atividade,
            porte:                   data.descricao_porte,
            natureza_juridica:       data.natureza_juridica,
            cnae_fiscal:             data.cnae_fiscal,
            cnae_fiscal_descricao:   data.cnae_fiscal_descricao,
            cnaes_secundarios:       data.cnaes_secundarios ?? [],
            logradouro:              data.logradouro,
            numero:                  data.numero,
            complemento:             data.complemento || null,
            bairro:                  data.bairro,
            municipio:               data.municipio,
            uf:                      data.uf,
            cep:                     data.cep,
            telefone_1:              data.ddd_telefone_1 || null,
            email:                   data.email || null,
            capital_social:          data.capital_social,
            opcao_pelo_simples:      data.opcao_pelo_simples,
            opcao_pelo_mei:          data.opcao_pelo_mei,
        };
    }
}
