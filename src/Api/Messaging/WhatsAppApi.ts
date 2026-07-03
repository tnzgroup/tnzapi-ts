import { UsefulStuff } from "../../Functions";
import { WhatsAppModel } from './models';
import { WhatsAppApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { BaseMessagingApi } from './BaseMessagingApi';
import { IWhatsAppArgs } from './interfaces';

export class WhatsAppApi extends BaseMessagingApi<WhatsAppModel> {
    protected entity: WhatsAppModel;
    protected readonly apiEndpoint = "/whatsapp";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new WhatsAppModel(args);
    }

    public async SendMessage(args?: IWhatsAppArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected createEntity(): WhatsAppModel {
        return new WhatsAppModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'ToNumber'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    protected validate(entity: WhatsAppModel): ValidationResult {
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

    protected createRequestDTO(entity: WhatsAppModel): MessagingBaseRequestDTO {
        return new WhatsAppApiRequestDTO(entity);
    }
}