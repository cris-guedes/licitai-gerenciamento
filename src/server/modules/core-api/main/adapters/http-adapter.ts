import type { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export interface ControllerContract {
    Body: any;
    Query: any;
    Params: any;
    Response: any;
}

export interface HttpRequest<T extends ControllerContract = any> {
    body:    T['Body'];
    query:   T['Query'];
    params:  T['Params'];
    headers: Record<string, string | undefined>;
    user?:   PrismaUserRepository.UserResponse;
}

export interface HttpResponse<TData = any> {
    statusCode: number;
    data: TData;
}

export interface Controller<T extends ControllerContract = any> {
    handle(request: HttpRequest<T>): Promise<HttpResponse<T['Response']>>;
}

export type PreHandler = (req: HttpRequest) => Promise<HttpRequest>;

export interface StreamController {
    handleStream(request: Request): Promise<Response>;
}

export interface RouteConfig {
    make?:        () => Controller;
    makeStream?:  () => StreamController;
    method?:      "GET" | "POST";
    preHandlers?: PreHandler[];
}

export const ok           = <T>(data: T): HttpResponse<T>  => ({ statusCode: 200, data });
export const created      = <T>(data: T): HttpResponse<T>  => ({ statusCode: 201, data });
export const badRequest   = (e: Error):   HttpResponse      => ({ statusCode: 400, data: { message: e.message } });
export const unauthorized = (e: Error):   HttpResponse      => ({ statusCode: 401, data: { message: e.message } });
export const notFound     = (e: Error):   HttpResponse      => ({ statusCode: 404, data: { message: e.message } });
export const serverError  = (e: Error):   HttpResponse      => ({ statusCode: 500, data: { message: e.message } });
