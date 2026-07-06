import { UsefulStuff } from "../../Functions";
import { SMSModel } from './models';
import { SMSApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { BaseMessagingApi } from './BaseMessagingApi';
import { IHttpClient } from '../../Common/IHttpClient';
import { ErrorResponseDTO } from '../../Common/dtos';
import { ValidationResult } from '../../Common/ValidationResult';
import { ISMSArgs } from './interfaces';

export class SMSApi extends BaseMessagingApi<SMSModel> {
    protected entity: SMSModel;
    protected readonly apiEndpoint = "/sms";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new SMSModel();
    }

    protected createEntity(): SMSModel {
        return new SMSModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'ToNumber'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    public async SendMessage(args?: ISMSArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected validate(entity: SMSModel): ValidationResult {
        const baseValidation = this.baseValidate(entity);
        if (!baseValidation.valid) {
            return baseValidation;
        }

        if (UsefulStuff.isEmpty(entity.Message) && UsefulStuff.isEmpty(entity.TemplateID)) {
            return { valid: false, error: "Missing Message or TemplateID" };
        }

        for (let i = 0; i < entity.Destinations.length; i++) {
            const destination = entity.Destinations[i];
            const number = destination.ToNumber ?? destination.Recipient;
            if (!UsefulStuff.isEmpty(number) && !UsefulStuff.isMobileNumber(number!)) {
                return { valid: false, error: `Invalid ToNumber - must be mobile number - ${number}` };
            }
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: SMSModel): MessagingBaseRequestDTO {
        return new SMSApiRequestDTO(entity);
    }
}