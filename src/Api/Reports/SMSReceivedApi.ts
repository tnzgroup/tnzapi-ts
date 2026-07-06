import { UsefulStuff, Map } from "../../Functions";
import { SMSReceivedApiRequestDTO, SMSReceivedApiResponseDTO, SMSReceivedDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ISMSReceivedArgs } from "./interfaces";

export class SMSReceivedApi {
    private baseUrl: string;
    private authToken: string;
    private entity: SMSReceivedApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new SMSReceivedApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    private MapApiResponse(responseData: any): SMSReceivedApiResponseDTO | ErrorResponseDTO {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Messages)) {
                const messages: SMSReceivedDTO[] = [];
                for (let i = 0; i < responseData.Messages.length; i++) {
                    messages.push(new SMSReceivedDTO(responseData.Messages[i]));
                }
                responseData.Messages = messages;
            }
            return new SMSReceivedApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    public async Poll(args?: ISMSReceivedArgs): Promise<SMSReceivedApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new SMSReceivedApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return this.MapApiResponse({
                "Result": Result.Error,
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const params: { [key: string]: any } = {
            "recordsPerPage": currentEntity.RecordsPerPage,
            "page": currentEntity.Page
        };

        if (!UsefulStuff.isEmpty(currentEntity.DateFrom) && !UsefulStuff.isEmpty(currentEntity.DateTo)) {
            params["dateFrom"] = currentEntity.DateFrom;
            params["dateTo"] = currentEntity.DateTo;
        } else {
            params["timePeriod"] = currentEntity.TimePeriod;
        }

        const url = `${this.baseUrl}/sms/received?${UsefulStuff.httpBuildQuery(params)}`;

        const responseData = await this.httpClient.get(url);
        return this.MapApiResponse(responseData);
    }

    private validate(entity: SMSReceivedApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.TimePeriod) && UsefulStuff.isEmpty(entity.DateFrom) && UsefulStuff.isEmpty(entity.DateTo)) {
            return { valid: false, error: "Missing TimePeriod or DateFrom & DateTo" };
        }
        const hasDateFrom = !UsefulStuff.isEmpty(entity.DateFrom);
        const hasDateTo = !UsefulStuff.isEmpty(entity.DateTo);
        if (hasDateFrom !== hasDateTo) {
            return { valid: false, error: "DateFrom and DateTo must be supplied together" };
        }
        if (!UsefulStuff.isNumber(entity.TimePeriod)) {
            return { valid: false, error: "TimePeriod must be a number - number of minutes" };
        }
        if (entity.TimePeriod < 1 || entity.TimePeriod > 1440) {
            return { valid: false, error: "TimePeriod must be between 1 and 1440 minutes" };
        }
        if (!UsefulStuff.isEmpty(entity.DateFrom) && !UsefulStuff.isDateTime(entity.DateFrom as string)) {
            return { valid: false, error: "DateFrom must be datetime format" };
        }
        if (!UsefulStuff.isEmpty(entity.DateTo) && !UsefulStuff.isDateTime(entity.DateTo as string)) {
            return { valid: false, error: "DateTo must be datetime format" };
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