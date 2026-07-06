import { Map, UsefulStuff } from "../../Functions";
import * as helpers from "./helpers";
import { RescheduleApiRequestDTO, ActionApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { IRescheduleArgs } from "./interfaces";

export class RescheduleApi {
    private baseUrl: string;
    private authToken: string;
    private entity: RescheduleApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new RescheduleApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async SendRequest(args?: IRescheduleArgs): Promise<ActionApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new RescheduleApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.baseUrl}/${UsefulStuff.encodePathSegment(currentEntity.Channel)}/${UsefulStuff.encodePathSegment(currentEntity.MessageID)}/reschedule`;

        const responseData = await this.httpClient.patch(url, { SendTime: currentEntity.SendTime });
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: RescheduleApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.MessageID)) {
            return { valid: false, error: "Missing MessageID" };
        }
        if (UsefulStuff.isEmpty(entity.Channel)) {
            return { valid: false, error: "Missing Channel - must be sms, email, fax, tts or voice" };
        }
        if (UsefulStuff.isEmpty(entity.SendTime)) {
            return { valid: false, error: "Missing SendTime" };
        }
        if (entity.SendTime && !UsefulStuff.isDateTime(entity.SendTime)) {
            return { valid: false, error: "Unable to parse SendTime. Use YYYY-MM-DD hh:mm format." };
        }
        return { valid: true };
    }
}