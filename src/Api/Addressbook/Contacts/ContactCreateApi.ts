import { Map, UsefulStuff } from "../../../Functions";
import * as helpers from "./helpers";
import { ContactApiRequestDTO, ContactApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ContactModel } from "./models";
import { IHttpClient } from "../../../Common/IHttpClient";
import { NodeHttpClient } from "../../../Common/NodeHttpClient";
import { ValidationResult } from "../../../Common/ValidationResult";
import { IContactCreateArgs } from "../interfaces";

export class ContactCreateApi {
    private url: string;
    private authToken: string;
    private entity: ContactApiRequestDTO;
    private httpClient: IHttpClient;

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        this.url = args.URL;
        this.authToken = args.AuthToken || "";
        this.entity = new ContactApiRequestDTO();
        this.httpClient = args.httpClient ?? new NodeHttpClient(this.authToken);
    }

    public async Run(args?: IContactCreateArgs): Promise<ContactApiResponseDTO | ErrorResponseDTO> {
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

        const responseData = await this.httpClient.post(this.url, currentEntity);
        return helpers.MapApiResponse(responseData);
    }

    private validate(entity: ContactApiRequestDTO): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }

        const contact = new ContactModel(entity);

        if (contact.EmailAddress && !UsefulStuff.isEmail(contact.EmailAddress)) {
            return { valid: false, error: "Invalid email address format for EmailAddress property" };
        }
        return { valid: true };
    }
}