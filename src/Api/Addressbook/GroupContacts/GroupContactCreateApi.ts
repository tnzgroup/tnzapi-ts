import { HttpRequestAsync, Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { GroupContactApiRequestDTO, GroupContactApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IGroupContactArgs } from "../interfaces";

export class GroupContactCreateApi {
    private contactUrl: string;
    private authToken: string;
    private entity: GroupContactApiRequestDTO;

    constructor(args: { URL: string; AuthToken?: string }) {
        this.contactUrl = args.URL.replace(/\/group\/?$/, '/contact');
        this.authToken = args.AuthToken || "";
        this.entity = new GroupContactApiRequestDTO();
    }

    public async Run(args?: IGroupContactArgs): Promise<GroupContactApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new GroupContactApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.contactUrl}/${UsefulStuff.encodePathSegment(currentEntity.ContactID)}/group`;
        const responseData = await HttpRequestAsync(url, currentEntity, this.authToken, "PATCH");
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: GroupContactApiRequestDTO): ValidationResult {
        if (entity.Group) {
            entity.GroupID = entity.Group.GroupID;
            delete entity.Group;
        }
        if (entity.Contact) {
            entity.ContactID = entity.Contact.ContactID;
            delete entity.Contact;
        }

        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.GroupID) && UsefulStuff.isEmpty(entity.GroupCode)) {
            return { valid: false, error: "Missing GroupID or GroupCode" };
        }
        if (UsefulStuff.isEmpty(entity.ContactID)) {
            return { valid: false, error: "Missing ContactID" };
        }
        return { valid: true };
    }
}