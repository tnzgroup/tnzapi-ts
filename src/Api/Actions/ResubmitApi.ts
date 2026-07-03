import { Map, UsefulStuff } from "../../Functions";
import * as helpers from "./helpers";
import { ResubmitApiRequestDTO, ActionApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { IResubmitArgs } from "./interfaces";

const RESUBMIT_CHANNELS = ['email', 'fax', 'tts', 'voice'];

export class ResubmitApi {
    private baseUrl: string;
    private authToken: string;
    private entity: ResubmitApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new ResubmitApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async SendRequest(args?: IResubmitArgs): Promise<ActionApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new ResubmitApiRequestDTO({ URL: this.baseUrl, AuthToken: this.authToken });

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.baseUrl}/${currentEntity.Channel}/${currentEntity.MessageID}/resubmit`;
        const payload = currentEntity.SendTime ? { SendTime: currentEntity.SendTime } : {};

        const responseData = await this.httpClient.patch(url, payload);
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: ResubmitApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.MessageID)) {
            return { valid: false, error: "Missing MessageID" };
        }
        if (UsefulStuff.isEmpty(entity.Channel)) {
            return { valid: false, error: "Missing Channel - must be email, fax, tts or voice" };
        }
        if (!RESUBMIT_CHANNELS.includes(entity.Channel!.toLowerCase())) {
            return { valid: false, error: `Resubmit is not supported for channel '${entity.Channel}' - must be email, fax, tts or voice` };
        }
        if (entity.SendTime && !UsefulStuff.isDateTime(entity.SendTime)) {
            return { valid: false, error: "Unable to parse SendTime. Use YYYY-MM-DD hh:mm format." };
        }
        return { valid: true };
    }
}