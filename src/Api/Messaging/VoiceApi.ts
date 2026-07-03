import { UsefulStuff, FileHandler } from "../../Functions";
import { VoiceModel } from './models';
import { VoiceApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { BaseMessagingApi } from './BaseMessagingApi';
import { IVoiceArgs } from './interfaces';

export class VoiceApi extends BaseMessagingApi<VoiceModel> {
    protected entity: VoiceModel;
    protected readonly apiEndpoint = "/voice";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new VoiceModel(args);
    }

    public async SendMessage(args?: IVoiceArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected createEntity(): VoiceModel {
        return new VoiceModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [['ToNumber', 'MainPhone'], ['GroupID', 'GroupID'], ['ContactID', 'ContactID']];
    }

    protected validate(entity: VoiceModel): ValidationResult {
        const base = this.baseValidate(entity);
        if (!base.valid) return base;

        if (UsefulStuff.isEmpty(entity.MessageToPeople) && UsefulStuff.isEmpty(entity.VoiceFiles) && UsefulStuff.isEmpty(entity.TemplateID)) {
            return { valid: false, error: "Missing MessageToPeople contents, VoiceFiles, or TemplateID" };
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
                if (UsefulStuff.isEmpty(keypad.RouteNumber) && UsefulStuff.isEmpty(keypad.Play) && UsefulStuff.isEmpty(keypad.PlayFile) && UsefulStuff.isEmpty(keypad.File) && UsefulStuff.isEmpty(keypad.PlaySection)) {
                    return { valid: false, error: `Empty Keypad ${keypad.Tone} Data: Please specify RouteNumber OR Play OR PlayFile OR File OR PlaySection` };
                }
            }
        }

        return { valid: true };
    }

    protected async processAttachments(entity: VoiceModel): Promise<void> {
        await super.processAttachments(entity);

        if (!UsefulStuff.isEmpty(entity.VoiceFiles)) {
            await Promise.all(entity.VoiceFiles.map(async (voiceFile) => {
                if (voiceFile.File) {
                    voiceFile.Data = await FileHandler.getFileData(voiceFile.File);
                }
            }));
        }

        if (!UsefulStuff.isEmpty(entity.Keypads)) {
            await Promise.all(entity.Keypads.map(async (keypad) => {
                if (!UsefulStuff.isEmpty(keypad.File)) {
                    keypad.PlayFile = await FileHandler.getFileData(keypad.File!);
                    delete keypad.File;
                }
            }));
        }
    }

    protected createRequestDTO(entity: VoiceModel): MessagingBaseRequestDTO {
        return new VoiceApiRequestDTO(entity);
    }

    public AddVoiceFile(field: string, file: string): this {
        if (FileHandler.fileExists(file)) {
            this.entity.VoiceFiles.push({
                "Name": field,
                "File": file,
                "Data": ""
            });
        }
        return this;
    }

    public AddKeypad(tone: number, routeNumber: string, play_file: string = "", playSection: string = ""): this {
        this.entity.Keypads.push({
            "Tone": tone,
            "RouteNumber": routeNumber,
            "File": play_file,
            "PlaySection": playSection
        });
        return this;
    }
}