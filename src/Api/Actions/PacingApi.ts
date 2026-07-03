import { Map, UsefulStuff } from "../../Functions";
import * as helpers from "./helpers";
import { PacingApiRequestDTO, ActionApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { IPacingArgs } from "./interfaces";

export class PacingApi {
    private baseUrl: string;
    private authToken: string;
    private entity: PacingApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new PacingApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async SendRequest(args?: IPacingArgs): Promise<ActionApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new PacingApiRequestDTO({ URL: this.baseUrl, AuthToken: this.authToken });

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.baseUrl}/${currentEntity.Channel}/${currentEntity.MessageID}/pacing`;

        const responseData = await this.httpClient.patch(url, { NumberOfOperators: currentEntity.NumberOfOperators });
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: PacingApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.MessageID)) {
            return { valid: false, error: "Missing MessageID" };
        }
        if (UsefulStuff.isEmpty(entity.Channel)) {
            return { valid: false, error: "Missing Channel - must be tts or voice" };
        }
        if (!['tts', 'voice'].includes(entity.Channel!.toLowerCase())) {
            return { valid: false, error: `Pacing is not supported for channel '${entity.Channel}' - must be tts or voice` };
        }
        if (!UsefulStuff.isNumber(entity.NumberOfOperators)) {
            return { valid: false, error: "NumberOfOperators must be a number" };
        }
        return { valid: true };
    }
}