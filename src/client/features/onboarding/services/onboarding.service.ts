import type { CoreApiClient } from "@/client/main/infra/apis/api-core"
import type { OnboardingSubmitData } from "../schemas/onboarding.schema"

/**
 * OnboardingAPI — Feature Service Bridge
 *
 * Methods receive the CoreApiClient as the first argument because our project
 * injects the auth token per request via useCoreApi() (a React hook).
 * Services are plain modules — they cannot call hooks.
 */
export const OnboardingAPI = {

  lookupCnpj: (api: CoreApiClient, cnpj: string) =>
    api.company.fetchCompanyByCnpj({ cnpj }),

  submit: (api: CoreApiClient, data: OnboardingSubmitData) =>
    api.onboarding.onboarding({
      requestBody: {
        cnpj:                    data.cnpj,
        razao_social:            data.razao_social,
        nome_fantasia:           data.nome_fantasia,
        situacao_cadastral:      data.situacao_cadastral,
        data_situacao_cadastral: data.data_situacao_cadastral,
        data_abertura:           data.data_abertura,
        porte:                   data.porte,
        natureza_juridica:       data.natureza_juridica,
        cnae_fiscal:             data.cnae_fiscal,
        cnae_fiscal_descricao:   data.cnae_fiscal_descricao,
        cnaes_secundarios:       data.cnaes_secundarios,
        logradouro:              data.logradouro,
        numero:                  data.numero,
        complemento:             data.complemento,
        bairro:                  data.bairro,
        municipio:               data.municipio,
        uf:                      data.uf,
        cep:                     data.cep,
        telefone_1:              data.telefone_1,
        email_empresa:           data.email_empresa,
        capital_social:          data.capital_social,
        opcao_pelo_simples:      data.opcao_pelo_simples,
        opcao_pelo_mei:          data.opcao_pelo_mei,
      },
    }),
}
