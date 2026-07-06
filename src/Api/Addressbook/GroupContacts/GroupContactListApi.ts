import { HttpRequestAsync, Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { GroupContactListApiRequestDTO, GroupContactListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IGroupContactListArgs } from "../interfaces";

export class GroupContactListApi {
    private url: string;
    private authToken: string;
    private entity: GroupContactListApiRequestDTO;

    constructor(args: { URL: string; AuthToken?: string }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new GroupContactListApiRequestDTO();
    }

    public async Run(args?: IGroupContactListArgs): Promise<GroupContactListApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new GroupContactListApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapListApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.url}/${UsefulStuff.encodeGroupSegment(currentEntity.GroupID, currentEntity.GroupCode)}/contact/list?recordsPerPage=${currentEntity.RecordsPerPage}&page=${currentEntity.Page}`;
        const responseData = await HttpRequestAsync(url, {}, this.authToken, "GET");
        return helpers.MapListApiResponse(responseData);
    }

    private validate(entity: GroupContactListApiRequestDTO): ValidationResult {
        if (entity.Group) {
            entity.GroupID = entity.Group.GroupID;
            delete entity.Group;
        }

        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.GroupID) && UsefulStuff.isEmpty(entity.GroupCode)) {
            return { valid: false, error: "Missing GroupID or GroupCode" };
        }
        if (!UsefulStuff.isNumber(entity.RecordsPerPage)) {
            return { valid: false, error: "RecordsPerPage must be a number" };
        }
        if (!UsefulStuff.isNumber(entity.Page)) {
            return { valid: false, error: "Page must be a number" };
        }
        return { valid: true };
    }
}