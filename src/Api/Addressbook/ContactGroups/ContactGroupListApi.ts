import { HttpRequestAsync, Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { ContactGroupListApiRequestDTO, ContactGroupListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IContactGroupListArgs } from "../interfaces";

export class ContactGroupListApi {
    private url: string;
    private authToken: string;
    private entity: ContactGroupListApiRequestDTO;

    constructor(args: { URL: string; AuthToken?: string }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new ContactGroupListApiRequestDTO(args);
    }

    public async Run(args?: IContactGroupListArgs): Promise<ContactGroupListApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new ContactGroupListApiRequestDTO({ URL: this.url, AuthToken: this.authToken });

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapListApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const url = `${this.url}/${currentEntity.ContactID}/Group/List?recordsPerPage=${currentEntity.RecordsPerPage}&page=${currentEntity.Page}`;

        const responseData = await HttpRequestAsync(url, {}, this.authToken, "GET");
        return helpers.MapListApiResponse(responseData);
    }

    private validate(entity: ContactGroupListApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(entity.ContactID)) {
            return { valid: false, error: "Missing ContactID" };
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