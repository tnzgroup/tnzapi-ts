import { UsefulStuff, Map } from "../../Functions";
import { SMSReplyApiRequestDTO, SMSReplyApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ISMSReplyArgs } from "./interfaces";

export class SMSReplyApi {
    private baseUrl: string;
    private authToken: string;
    private entity: SMSReplyApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new SMSReplyApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    private MapApiResponse(responseData: any): SMSReplyApiResponseDTO | ErrorResponseDTO {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            return new SMSReplyApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    public async Poll(args?: ISMSReplyArgs): Promise<SMSReplyApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new SMSReplyApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return this.MapApiResponse({
                "Result": Result.Error,
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.baseUrl}/sms/${UsefulStuff.encodePathSegment(currentEntity.MessageID)}?recordsPerPage=${currentEntity.RecordsPerPage}&page=${currentEntity.Page}`;

        const responseData = await this.httpClient.get(url);
        return this.MapApiResponse(responseData);
    }

    private validate(entity: SMSReplyApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
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
            return { valid: false, error: "Page must be greater then 1" };
        }
        return { valid: true };
    }
}