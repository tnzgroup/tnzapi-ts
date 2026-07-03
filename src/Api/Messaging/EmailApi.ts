import { UsefulStuff } from "../../Functions";
import { EmailModel } from './models';
import { EmailApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { BaseMessagingApi } from './BaseMessagingApi';
import { IHttpClient } from '../../Common/IHttpClient';
import { ErrorResponseDTO } from '../../Common/dtos';
import { ValidationResult } from '../../Common/ValidationResult';
import { IEmailArgs } from './interfaces';

export class EmailApi extends BaseMessagingApi<EmailModel> {
    protected entity: EmailModel;
    protected readonly apiEndpoint = "/email";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new EmailModel(args);
    }

    protected createEntity(): EmailModel {
        return new EmailModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['EmailAddress', 'EmailAddress'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    public async SendMessage(args?: IEmailArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected validate(entity: EmailModel): ValidationResult {
        const baseValidation = this.baseValidate(entity);
        if (!baseValidation.valid) {
            return baseValidation;
        }

        if (UsefulStuff.isEmpty(entity.EmailSubject)) {
            return { valid: false, error: "Missing EmailSubject" };
        }
        if (UsefulStuff.isEmpty(entity.MessagePlain) && UsefulStuff.isEmpty(entity.MessageHTML) && UsefulStuff.isEmpty(entity.TemplateID)) {
            return { valid: false, error: "Missing MessagePlain, MessageHTML or TemplateID" };
        }

        for (let i = 0; i < entity.Destinations.length; i++) {
            const destination = entity.Destinations[i];
            const address = destination.EmailAddress ?? destination.Recipient;
            if (!UsefulStuff.isEmpty(address) && !UsefulStuff.isEmail(address!)) {
                return { valid: false, error: `Invalid EmailAddress - must be email address - ${address}` };
            }
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: EmailModel): MessagingBaseRequestDTO {
        return new EmailApiRequestDTO(entity);
    }
}