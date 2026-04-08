/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { ChunkService } from './services/ChunkService';
import { ClearService } from './services/ClearService';
import { ConvertService } from './services/ConvertService';
import { DefaultService } from './services/DefaultService';
import { HealthService } from './services/HealthService';
import { ManagementService } from './services/ManagementService';
import { TasksService } from './services/TasksService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class DoclingClient {
  public readonly chunk: ChunkService;
  public readonly clear: ClearService;
  public readonly convert: ConvertService;
  public readonly default: DefaultService;
  public readonly health: HealthService;
  public readonly management: ManagementService;
  public readonly tasks: TasksService;
  public readonly request: BaseHttpRequest;
  constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? '',
      VERSION: config?.VERSION ?? '1.15.1',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.chunk = new ChunkService(this.request);
    this.clear = new ClearService(this.request);
    this.convert = new ConvertService(this.request);
    this.default = new DefaultService(this.request);
    this.health = new HealthService(this.request);
    this.management = new ManagementService(this.request);
    this.tasks = new TasksService(this.request);
  }
}

