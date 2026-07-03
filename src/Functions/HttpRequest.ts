import * as https from 'https';
import * as http from 'http';
import { isEmpty } from "./UsefulStuff";

const sslIgnoreAgent = new https.Agent({ rejectUnauthorized: false });

interface HostDetails {
    Port: number;
    Host: string;
    Path: string;
    Protocol: string;
}

export const GetHostDetails = (url: string): HostDetails | undefined => {
    try {
        const parsed = new URL(url);
        const protocol = parsed.protocol.replace(':', ''); // 'https' or 'http'
        if (protocol !== 'https' && protocol !== 'http') {
            return undefined;
        }
        const defaultPort = protocol === 'https' ? 443 : 80;
        return {
            Host: parsed.hostname,
            Port: parsed.port ? parseInt(parsed.port, 10) : defaultPort,
            Path: parsed.pathname + parsed.search,
            Protocol: protocol,
        };
    } catch {
        return undefined;
    }
};

const request = (options: http.RequestOptions, callback: (data: any, err?: Error) => void): http.ClientRequest => {
    const requester = options.protocol === 'https:' ? https.request : http.request;

    return requester(options, (res: http.IncomingMessage) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                    try {
                        callback({ HttpStatusCode: res.statusCode, ...JSON.parse(data) });
                    } catch {
                        callback({ HttpStatusCode: res.statusCode, Result: "Error", ErrorMessage: [`Request failed with status code ${res.statusCode}: ${data}`] });
                    }
                } else if (data === '') {
                    callback({ HttpStatusCode: res.statusCode, Result: "Success" });
                } else {
                    callback({ HttpStatusCode: res.statusCode, ...JSON.parse(data) });
                }
            } catch (error: any) {
                callback(null, new Error('Failed to parse response as JSON: ' + error.message));
            }
        });
        res.on('error', (err) => {
            callback(null, err);
        });
    });
};


export const HttpRequest = (url: string, payload: any, authToken: string, method: string, callback: (data: any) => void): void => {
    const host = GetHostDetails(url);

    if (!host) {
        callback({ Result: "Error", ErrorMessage: ["Invalid URL"] });
        return;
    }

    const isGet = method.toUpperCase() === 'GET';
    const postData = isGet ? '' : JSON.stringify(payload);

    const headers: http.OutgoingHttpHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': !isEmpty(authToken) ? `Bearer ${authToken}` : "",
        'User-Agent': 'tnzapi-nodejs-ts/3.00'
    };

    if (!isGet) {
        headers['Content-Length'] = Buffer.byteLength(postData, 'utf8');
    }

    const options: http.RequestOptions = {
        hostname: host.Host,
        port: host.Port,
        path: host.Path,
        method: method,
        protocol: `${host.Protocol}:`,
        headers: headers,
        ...(host.Protocol === 'https' && process.env.TNZ_IGNORE_SSL === 'true'
            ? { agent: sslIgnoreAgent }
            : {})
    };

    let callbackCalled = false;
    const safeCallback = (data: any) => {
        if (!callbackCalled) {
            callbackCalled = true;
            callback(data);
        }
    };

    const req = request(options, (responseData, err) => {
        if (err) {
            safeCallback({ Result: "Error", ErrorMessage: [err.message] });
            return;
        }
        safeCallback(responseData);
    });

    req.setTimeout(30000, () => {
        req.destroy(new Error('Request timed out'));
    });

    req.on('error', (error) => {
        safeCallback({ Result: "Error", ErrorMessage: [error.message] });
    });

    if (!isGet) {
        req.write(postData);
    }
    req.end();
};

export const HttpRequestAsync = (url: string, payload: any, authToken: string, method: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        HttpRequest(url, payload, authToken, method, (data) => {
            resolve(data);
        });
    });
};