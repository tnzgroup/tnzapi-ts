import { HttpRequest } from '../Functions/HttpRequest';
import { IHttpClient } from './IHttpClient';

export class NodeHttpClient implements IHttpClient {
    constructor(private readonly authToken: string) {}

    private request<T>(url: string, method: string, payload: any = {}): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                HttpRequest(url, payload, this.authToken, method, resolve);
            } catch (err) {
                reject(err);
            }
        });
    }

    get<T = any>(url: string): Promise<T> { return this.request<T>(url, 'GET'); }
    post<T = any>(url: string, payload: any): Promise<T> { return this.request<T>(url, 'POST', payload); }
    patch<T = any>(url: string, payload: any): Promise<T> { return this.request<T>(url, 'PATCH', payload); }
    delete<T = any>(url: string, payload?: any): Promise<T> { return this.request<T>(url, 'DELETE', payload); }
}