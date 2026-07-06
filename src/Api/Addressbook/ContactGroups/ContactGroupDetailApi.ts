import { HttpRequestAsync, Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { ContactGroupApiRequestDTO, ContactGroupApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IContactGroupArgs } from "../interfaces";

export class ContactGroupDetailApi {
    private url: string;
    private authToken: string;
    private entity: ContactGroupApiRequestDTO;

    constructor(args: { URL: string; AuthToken?: string }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new ContactGroupApiRequestDTO();
    }

    public async Run(args?: IContactGroupArgs): Promise<ContactGroupApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new ContactGroupApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.url}/${UsefulStuff.encodePathSegment(currentEntity.ContactID)}/Group/${UsefulStuff.encodeGroupSegment(currentEntity.GroupID, currentEntity.GroupCode)}`;

        const responseData = await HttpRequestAsync(url, {}, this.authToken, "GET");
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: ContactGroupApiRequestDTO): ValidationResult {
        if (entity.Contact) {
            entity.ContactID = entity.Contact.ContactID;
            delete entity.Contact;
        }
        if (entity.Group) {
            entity.GroupID = entity.Group.GroupID;
            delete entity.Group;
        }

        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.ContactID)) {
            return { valid: false, error: "Missing ContactID" };
        }
        if (UsefulStuff.isEmpty(entity.GroupID) && UsefulStuff.isEmpty(entity.GroupCode)) {
            return { valid: false, error: "Missing GroupID or GroupCode" };
        }
        return { valid: true };
    }
}