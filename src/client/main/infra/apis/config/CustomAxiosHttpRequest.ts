import axios, { type AxiosInstance } from "axios";
import { AxiosHttpRequest } from "../api-core/core/AxiosHttpRequest";
import type { ApiRequestOptions } from "../api-core/core/ApiRequestOptions";
import type { CancelablePromise } from "../api-core/core/CancelablePromise";
import type { OpenAPIConfig } from "../api-core/core/OpenAPI";
import { request as __request } from "../api-core/core/request";

/**
 * Extensão do AxiosHttpRequest com uma instância axios isolada e interceptors
 * para logs e tratamento de erros. Passada como HttpRequest ao CoreApiClient.
 */
export class CustomAxiosHttpRequest extends AxiosHttpRequest {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: OpenAPIConfig) {
    super(config);

    this.axiosInstance = axios.create();

    this.axiosInstance.interceptors.request.use((req) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[API →] ${req.method?.toUpperCase()} ${req.url}`, req.params ?? {});
      }
      return req;
    });

    this.axiosInstance.interceptors.response.use(
      (res) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[API ✓] ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data);
        }
        return res;
      },
      (error) => {
        const status = error.response?.status
        // 400/404/422 are expected "not found / invalid" responses from PNCP — log as warn, not error
        if (process.env.NODE_ENV === "development") {
          if (status === 400 || status === 404 || status === 422) {
            console.warn(`[API ✗] ${error.config?.method?.toUpperCase()} ${error.config?.url} (${status})`)
          } else {
            console.error(`[API ✗] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data ?? error.message)
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return __request(this.config, options, this.axiosInstance);
  }
}
