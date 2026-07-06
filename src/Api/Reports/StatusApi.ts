import { UsefulStuff, Map } from "../../Functions";
import { StatusApiRequestDTO, StatusApiResponseDTO, RecipientDTO, SMSReplyRecipientDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { IStatusArgs } from "./interfaces";

export class StatusApi {
    private baseUrl: string;
    private authToken: string;
    private entity: StatusApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new StatusApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    private MapStatusResponse(responseData: any, channel: string): StatusApiResponseDTO | ErrorResponseDTO {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Recipients)) {
                const isSMS = (channel || 'sms').toLowerCase() === 'sms';
                const recipients: RecipientDTO[] = [];
                for (let i = 0; i < responseData.Recipients.length; i++) {
                    if (isSMS) {
                        recipients.push(new SMSReplyRecipientDTO(responseData.Recipients[i]));
                    } else {
                        recipients.push(new RecipientDTO(responseData.Recipients[i]));
                    }
                }
                responseData.Recipients = recipients;
            }
            return new StatusApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    public async Poll(args?: IStatusArgs): Promise<StatusApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new StatusApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return this.MapStatusResponse({
                "Result": Result.Error,
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            }, currentEntity.Channel || 'sms');
        }

        const channel = currentEntity.Channel || 'sms';
        const url = `${this.baseUrl}/${UsefulStuff.encodePathSegment(channel)}/${UsefulStuff.encodePathSegment(currentEntity.MessageID)}?recordsPerPage=${currentEntity.RecordsPerPage}&page=${currentEntity.Page}`;

        const responseData = await this.httpClient.get(url);
        return this.MapStatusResponse(responseData, channel);
    }

    private validate(entity: StatusApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing Auth Token" };
        }
        if (UsefulStuff.isEmpty(entity.MessageID)) {
            return { valid: false, error: "Missing MessageID" };
        }
        if (!UsefulStuff.isNumber(entity.RecordsPerPage)) {
            return { valid: false, error: "RecordsPerPage must be a number" };
        }
        if (entity.RecordsPerPage < 1 || entity.RecordsPerPage > 999) {
            return { valid: false, error: "RecordsPerPage must be between 1 and 999" };
        }
        if (!UsefulStuff.isNumber(entity.Page)) {
            return { valid: false, error: "Page must be a number" };
        }
        if (entity.Page < 1) {
            return { valid: false, error: "Page must be greater than 1" };
        }
        return { valid: true };
    }
}