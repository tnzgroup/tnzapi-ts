import { Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { GroupListApiRequestDTO, GroupListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { IHttpClient } from "../../../Common/IHttpClient";
import { NodeHttpClient } from "../../../Common/NodeHttpClient";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IGroupListArgs } from "../interfaces";

export class GroupListApi {
    private url: string;
    private authToken: string;
    private entity: GroupListApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new GroupListApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IGroupListArgs): Promise<GroupListApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new GroupListApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapListApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.url}/List?recordsPerPage=${currentEntity.RecordsPerPage}&page=${currentEntity.Page}`;

        const responseData = await this.httpClient.get(url);
        return helpers.MapListApiResponse(responseData);
    }

    private validate(entity: GroupListApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (!UsefulStuff.isNumber(entity.RecordsPerPage)) {
            return { valid: false, error: "RecordPerPage must be a number" };
        }
        if (!UsefulStuff.isNumber(entity.Page)) {
            return { valid: false, error: "Page must be a number" };
        }
        return { valid: true };
    }
}