import { Map, UsefulStuff } from "../../Functions";
import * as helpers from "./helpers";
import { AbortApiRequestDTO, ActionApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { IAbortArgs } from "./interfaces";

export class AbortApi {
    private baseUrl: string;
    private authToken: string;
    private entity: AbortApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new AbortApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async SendRequest(args?: IAbortArgs): Promise<ActionApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new AbortApiRequestDTO({ URL: this.baseUrl, AuthToken: this.authToken });

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.baseUrl}/${currentEntity.Channel}/${currentEntity.MessageID}/abort`;

        const responseData = await this.httpClient.patch(url, {});
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: AbortApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.MessageID)) {
            return { valid: false, error: "Missing MessageID" };
        }
        if (UsefulStuff.isEmpty(entity.Channel)) {
            return { valid: false, error: "Missing Channel - must be sms, email, fax, tts or voice" };
        }
        return { valid: true };
    }
}