import { UsefulStuff } from "../../Functions";
import { TTSModel } from './models';
import { TTSApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { BaseMessagingApi } from './BaseMessagingApi';
import { ITTSArgs } from './interfaces';

export class TTSApi extends BaseMessagingApi<TTSModel> {
    protected entity: TTSModel;
    protected readonly apiEndpoint = "/tts";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new TTSModel(args);
    }

    public async SendMessage(args?: ITTSArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected createEntity(): TTSModel {
        return new TTSModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'MainPhone'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    protected validate(entity: TTSModel): ValidationResult {
        const base = this.baseValidate(entity);
        if (!base.valid) return base;

        if (UsefulStuff.isEmpty(entity.MessageToPeople) && UsefulStuff.isEmpty(entity.TemplateID)) {
            return { valid: false, error: "Missing MessageToPeople or TemplateID" };
        }
        if (!UsefulStuff.isEmpty(entity.RetryAttempts) && !UsefulStuff.isNumber(entity.RetryAttempts)) {
            return { valid: false, error: "RetryAttempts must be a number" };
        }
        if (!UsefulStuff.isEmpty(entity.RetryPeriod) && !UsefulStuff.isNumber(entity.RetryPeriod)) {
            return { valid: false, error: "RetryPeriod must be a number" };
        }
        if (!UsefulStuff.isEmpty(entity.NumberOfOperators) && !UsefulStuff.isNumber(entity.NumberOfOperators)) {
            return { valid: false, error: "NumberOfOperators must be a number" };
        }

        for (const destination of entity.Destinations) {
            const phone = destination.MainPhone ?? destination.Recipient;
            if (!UsefulStuff.isEmpty(phone) && !UsefulStuff.isPhoneNumber(phone!)) {
                return { valid: false, error: `Invalid Recipient - must be phone number - ${phone}` };
            }
        }

        if (!UsefulStuff.isEmpty(entity.Keypads)) {
            for (const keypad of entity.Keypads) {
                if (UsefulStuff.isEmpty(keypad.RouteNumber) && UsefulStuff.isEmpty(keypad.Play) && UsefulStuff.isEmpty(keypad.PlaySection)) {
                    return { valid: false, error: `Empty Keypad ${keypad.Tone} Data: Please specify RouteNumber OR Play OR PlaySection` };
                }
            }
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: TTSModel): MessagingBaseRequestDTO {
        return new TTSApiRequestDTO(entity);
    }

    public AddKeypad(tone: number, routeNumber: string, play: string = "", playSection: string = ""): this {
        this.entity.Keypads.push({
            "Tone": tone,
            "RouteNumber": routeNumber,
            "Play": play,
            "PlaySection": playSection
        });
        return this;
    }
}