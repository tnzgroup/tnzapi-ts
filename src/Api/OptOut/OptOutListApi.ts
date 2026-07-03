import { UsefulStuff, Map } from "../../Functions";
import { OptOutListApiRequestDTO, OptOutListApiResponseDTO, OptOutApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { IOptOutListArgs } from "./interfaces";

export class OptOutListApi {
    private baseUrl: string;
    private authToken: string;
    private entity: OptOutListApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new OptOutListApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IOptOutListArgs): Promise<OptOutListApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new OptOutListApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return new ErrorResponseDTO({
                "Result": Result.Error,
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const params: { [key: string]: any } = {
            "recordsPerPage": currentEntity.RecordsPerPage,
            "page": currentEntity.Page
        };
        if (currentEntity.DestType) params["destType"] = currentEntity.DestType;
        if (currentEntity.TimePeriod !== undefined) params["timePeriod"] = currentEntity.TimePeriod;
        if (currentEntity.ContactID) params["contactID"] = currentEntity.ContactID;

        const queryString = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const url = `${this.baseUrl}/optout/list?${queryString}`;

        const responseData = await this.httpClient.get(url);

        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            // Some server deployments still serialize this array under the legacy
            // wire key "Data" instead of "OptOuts" — prefer OptOuts when the server sent
            // that key at all (even an empty array), fall back to Data only if it didn't.
            const rawOptOuts = responseData.OptOuts != null ? responseData.OptOuts : responseData.Data;
            if (!UsefulStuff.isEmpty(rawOptOuts)) {
                responseData.OptOuts = rawOptOuts.map((o: any) => new OptOutApiResponseDTO(o));
            }
            return new OptOutListApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    private validate(entity: OptOutListApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        return { valid: true };
    }
}