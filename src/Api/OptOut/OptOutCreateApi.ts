import { UsefulStuff, Map } from "../../Functions";
import { OptOutApiRequestDTO, OptOutApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { IOptOutCreateArgs } from "./interfaces";

export class OptOutCreateApi {
    private baseUrl: string;
    private authToken: string;
    private entity: OptOutApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new OptOutApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IOptOutCreateArgs): Promise<OptOutApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new OptOutApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return new ErrorResponseDTO({
                "Result": Result.Error,
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const responseData = await this.httpClient.post(`${this.baseUrl}/optout`, currentEntity);

        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            return new OptOutApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    private validate(entity: OptOutApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.Destination)) {
            return { valid: false, error: "Missing Destination" };
        }
        if (UsefulStuff.isEmpty(entity.DestType)) {
            return { valid: false, error: "Missing DestType" };
        }
        return { valid: true };
    }
}