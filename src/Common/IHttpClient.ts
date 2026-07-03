export interface IHttpClient {
    get<T = any>(url: string): Promise<T>;
    post<T = any>(url: string, payload: any): Promise<T>;
    patch<T = any>(url: string, payload: any): Promise<T>;
    delete<T = any>(url: string, payload?: any): Promise<T>;
}