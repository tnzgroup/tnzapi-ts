import { UsefulStuff } from "../../Functions";
import { RCSModel } from './models';
import { RCSApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { BaseMessagingApi } from './BaseMessagingApi';
import { IRCSArgs } from './interfaces';

export class RCSApi extends BaseMessagingApi<RCSModel> {
    protected entity: RCSModel;
    protected readonly apiEndpoint = "/rcs";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new RCSModel();
    }

    public async SendMessage(args?: IRCSArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected createEntity(): RCSModel {
        return new RCSModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'ToNumber'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    protected validate(entity: RCSModel): ValidationResult {
        const base = this.baseValidate(entity);
        if (!base.valid) return base;

        if (UsefulStuff.isEmpty(entity.Message) && UsefulStuff.isEmpty(entity.TemplateID)) {
            return { valid: false, error: "Missing Message or TemplateID" };
        }

        for (const destination of entity.Destinations) {
            if (!destination) continue;
            const number = destination.ToNumber || destination.Recipient;
            if (!UsefulStuff.isEmpty(number) && !UsefulStuff.isPhoneNumber(number!)) {
                return { valid: false, error: `Invalid ToNumber - must be phone number - ${number}` };
            }
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: RCSModel): MessagingBaseRequestDTO {
        return new RCSApiRequestDTO(entity);
    }
}