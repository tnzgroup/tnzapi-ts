import { Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { ContactApiRequestDTO, ContactApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ContactModel } from "./models";
import { IHttpClient } from "../../../Common/IHttpClient";
import { NodeHttpClient } from "../../../Common/NodeHttpClient";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IContactDetailArgs } from "../interfaces";

export class ContactDetailApi {
    private url: string;
    private authToken: string;
    private entity: ContactApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new ContactApiRequestDTO(args);
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IContactDetailArgs): Promise<ContactApiResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        this.entity = new ContactApiRequestDTO(); // Reset state for next call

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        const contact = new ContactModel(currentEntity);
        const url = `${this.url}/${contact.ContactID}`;

        const responseData = await this.httpClient.get(url);
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: ContactApiRequestDTO): ValidationResult {
        const contact = new ContactModel(entity);

        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (UsefulStuff.isEmpty(contact.ContactID)) {
            return { valid: false, error: "Missing ContactID" };
        }
        return { valid: true };
    }
}