/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { AuthService } from './services/AuthService';
import { CompanyService } from './services/CompanyService';
import { OnboardingService } from './services/OnboardingService';
import { SearchService } from './services/SearchService';
import { TeamService } from './services/TeamService';
import { LicitacaoService } from './services/LicitacaoService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class CoreApiClient {
  public readonly auth: AuthService;
  public readonly company: CompanyService;
  public readonly onboarding: OnboardingService;
  public readonly search: SearchService;
  public readonly team: TeamService;
  public readonly licitacao: LicitacaoService;
  public readonly request: BaseHttpRequest;
  constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? '/api/core',
      VERSION: config?.VERSION ?? '1.0.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.auth = new AuthService(this.request);
    this.company = new CompanyService(this.request);
    this.onboarding = new OnboardingService(this.request);
    this.search = new SearchService(this.request);
    this.team = new TeamService(this.request);
    this.licitacao = new LicitacaoService(this.request);
  }
}

