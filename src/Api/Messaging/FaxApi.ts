import { UsefulStuff } from "../../Functions";
import { FaxModel } from './models';
import { FaxApiRequestDTO, MessagingBaseRequestDTO } from './dtos';
import { BaseMessagingApi } from './BaseMessagingApi';
import { IHttpClient } from '../../Common/IHttpClient';
import { ValidationResult } from '../../Common/ValidationResult';
import { IFaxArgs } from './interfaces';

export class FaxApi extends BaseMessagingApi<FaxModel> {
    protected entity: FaxModel;
    protected readonly apiEndpoint = "/fax";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new FaxModel(args);
    }

    protected createEntity(): FaxModel {
        return new FaxModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'ToNumber'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    protected validate(entity: FaxModel): ValidationResult {
        const baseValidation = this.baseValidate(entity);
        if (!baseValidation.valid) {
            return baseValidation;
        }

        if (UsefulStuff.isEmpty(entity.TemplateID) && UsefulStuff.isEmpty(entity.Files) && UsefulStuff.isEmpty(entity.Attachments)) {
            return { valid: false, error: "Missing fax contents - TemplateID or File Attachments required" };
        }
        if (!UsefulStuff.isEmpty(entity.RetryAttempts) && !UsefulStuff.isNumber(entity.RetryAttempts)) {
            return { valid: false, error: "RetryAttempts must be a number" };
        }
        if (!UsefulStuff.isEmpty(entity.RetryPeriod) && !UsefulStuff.isNumber(entity.RetryPeriod)) {
            return { valid: false, error: "RetryPeriod must be a number" };
        }

        for (let i = 0; i < entity.Destinations.length; i++) {
            const destination = entity.Destinations[i];
            const number = destination.ToNumber ?? destination.Recipient;
            if (!UsefulStuff.isEmpty(number) && !UsefulStuff.isPhoneNumber(number!)) {
                return { valid: false, error: `Invalid Recipient - must be phone number - ${number}` };
            }
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: FaxModel): MessagingBaseRequestDTO {
        return new FaxApiRequestDTO(entity);
    }
}
