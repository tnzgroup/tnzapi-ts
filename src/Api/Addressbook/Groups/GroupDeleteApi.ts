import { Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { GroupApiRequestDTO, GroupApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { GroupModel } from "./models";
import { IHttpClient } from "../../../Common/IHttpClient";
import { NodeHttpClient } from "../../../Common/NodeHttpClient";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IGroupDeleteArgs } from "../interfaces";

export class GroupDeleteApi {
    private url: string;
    private authToken: string;
    private entity: GroupApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new GroupApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IGroupDeleteArgs): Promise<GroupApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new GroupApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const group = new GroupModel(currentEntity);
        const url = `${this.url}/${UsefulStuff.encodeGroupSegment(group.GroupID, group.GroupCode)}`;

        const responseData = await this.httpClient.delete(url);
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: GroupApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }

        const group = new GroupModel(entity);

        if (UsefulStuff.isEmpty(group.GroupID) && UsefulStuff.isEmpty(group.GroupCode)) {
            return { valid: false, error: "Missing GroupID or GroupCode" };
        }
        return { valid: true };
    }
}