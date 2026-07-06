import { UsefulStuff, Map } from "../../Functions";
import { OptOutApiRequestDTO, OptOutApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { Result } from "../../Common/Result";
import { isSuccessResult } from "../../Common/isSuccessResult";
import { ValidationResult } from "../../Common/ValidationResult";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { IOptOutDetailArgs } from "./interfaces";

export class OptOutDetailApi {
    private baseUrl: string;
    private authToken: string;
    private entity: OptOutApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.baseUrl = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new OptOutApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IOptOutDetailArgs): Promise<OptOutApiResponseDTO | ErrorResponseDTO> {
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

        const url = `${this.baseUrl}/optout/${UsefulStuff.encodePathSegment(currentEntity.OptOutID)}`;
        const responseData = await this.httpClient.get(url);

        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            return new OptOutApiResponseDTO(responseData);
        }
        return new ErrorResponseDTO(responseData);
    }

    private validate(entity: OptOutApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.OptOutID)) {
            return { valid: false, error: "Missing OptOutID" };
        }
        return { valid: true };
    }
}