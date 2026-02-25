export interface HttpResponse<T = unknown> {
    data: T;
    status: number;
}

export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * IHttpClient - Port (Interface)
 * Defines the contract for HTTP communication
 */
export interface IHttpClient {
    get(url: string, config?: RequestConfig): Promise<HttpResponse>;
    post(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse>;
    put(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse>;
    patch(url: string, data?: unknown, config?: RequestConfig): Promise<HttpResponse>;
    delete(url: string, config?: RequestConfig): Promise<HttpResponse>;
    addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void;
    addResponseInterceptor(
        onSuccess: (response: unknown) => unknown,
        onError: (error: unknown) => unknown
    ): void;
}
