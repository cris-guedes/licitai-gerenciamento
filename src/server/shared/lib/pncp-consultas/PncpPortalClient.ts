/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AtaService } from './services/AtaService';
import { ContrataOService } from './services/ContrataOService';
import { ContratoEmpenhoService } from './services/ContratoEmpenhoService';
import { InstrumentoDeCobranADeContratoEmpenhoService } from './services/InstrumentoDeCobranADeContratoEmpenhoService';
import { PlanoDeContrataOService } from './services/PlanoDeContrataOService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class PncpPortalClient {
  public readonly ata: AtaService;
  public readonly contrataO: ContrataOService;
  public readonly contratoEmpenho: ContratoEmpenhoService;
  public readonly instrumentoDeCobranADeContratoEmpenho: InstrumentoDeCobranADeContratoEmpenhoService;
  public readonly planoDeContrataO: PlanoDeContrataOService;
  public readonly request: BaseHttpRequest;
  constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'https://pncp.gov.br/api/consulta',
      VERSION: config?.VERSION ?? '1.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.ata = new AtaService(this.request);
    this.contrataO = new ContrataOService(this.request);
    this.contratoEmpenho = new ContratoEmpenhoService(this.request);
    this.instrumentoDeCobranADeContratoEmpenho = new InstrumentoDeCobranADeContratoEmpenhoService(this.request);
    this.planoDeContrataO = new PlanoDeContrataOService(this.request);
  }
}

