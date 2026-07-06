import { UsefulStuff, Map, FileHandler } from "../../Functions";
import * as helpers from "./helpers";
import { IMessagingModel } from './models';
import { MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { NodeHttpClient } from "../../Common/NodeHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { IAddRecipientArg } from "./helpers/AddRecipient";

export abstract class BaseMessagingApi<T extends IMessagingModel> {
    protected abstract entity: T;
    protected abstract readonly apiEndpoint: string;
    // File paths passed to AddAttachment()/AddVoiceFile() that failed FileHandler.fileExists() —
    // tracked here (not on `entity`) because MessagingBaseRequestDTO subclasses Map() every own
    // property of `entity` onto the outbound DTO regardless of whether the DTO declares it, so a
    // tracking field on the model would leak into the live API request body.
    protected missingAttachments: string[] = [];
    constructor(
        protected readonly baseUrl: string,
        protected readonly authToken: string,
        protected readonly httpClient: IHttpClient = new NodeHttpClient(authToken)
    ) {}

    protected abstract createEntity(): T;

    protected abstract validate(entity: T): ValidationResult;

    protected abstract createRequestDTO(entity: T): MessagingBaseRequestDTO;

    /**
     * Single-destination shorthand fields this channel accepts, as [inputFieldName, destinationKey]
     * pairs. Override in subclasses; default is none. See resolveSingleDestinations().
     */
    protected singleDestinationFields(): Array<[string, string]> {
        return [];
    }

    private resolveSingleDestinations(entity: T): void {
        for (const [field, destinationKey] of this.singleDestinationFields()) {
            const raw = (entity as unknown as Record<string, unknown>)[field];
            if (typeof raw === 'string' && !UsefulStuff.isEmpty(raw)) {
                for (const value of raw.split(',').map(v => v.trim()).filter(v => v.length > 0)) {
                    entity.Destinations.push({ [destinationKey]: value } as T['Destinations'][number]);
                }
            }
            // Clear unconditionally so this transient field can never leak into the
            // outbound request DTO — Map() copies any own property of `entity`, not just
            // ones the target DTO class declares (see Functions/Mapper.ts).
            (entity as unknown as Record<string, unknown>)[field] = undefined;
        }
    }

    public async SendMessage(args?: any): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        if (args) {
            Map(this.entity, args);
        }

        const currentEntity = this.entity;
        const missingAttachments = this.missingAttachments;
        this.entity = this.createEntity(); // Reset state for next call
        this.missingAttachments = [];

        this.resolveSingleDestinations(currentEntity);

        const validation = this.validate(currentEntity);
        if (!validation.valid) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [validation.error || "An error occurred while processing."]
            });
        }

        if (missingAttachments.length > 0) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": missingAttachments.map(path => `Attachment file not found: ${path}`)
            });
        }

        try {
            await this.processAttachments(currentEntity);
        } catch (err: any) {
            return helpers.MapApiResponse({
                "Result": "Error",
                "ErrorMessage": [`Failed to process attachments: ${err?.message ?? err}`]
            });
        }

        const responseData = await this.httpClient.post(`${this.baseUrl}${this.apiEndpoint}`, this.createRequestDTO(currentEntity));
        return helpers.MapApiResponse(responseData);
    }

    protected async processAttachments(entity: T): Promise<void> {
        if (!UsefulStuff.isEmpty(entity.Attachments)) {
            const files = await Promise.all(
                entity.Attachments.map(async (attachment) => {
                    const baseName = FileHandler.getBaseName(attachment);
                    const fileData = await FileHandler.getFileData(attachment);
                    return {
                        Name: baseName,
                        Data: fileData
                    };
                })
            );
            entity.Files.push(...files);
        }
    }

    protected baseValidate(entity: T): ValidationResult {
        if (UsefulStuff.isEmpty(this.authToken)) {
            return { valid: false, error: "Missing AuthToken" };
        }
        if (!UsefulStuff.isEmpty(entity.WebhookCallbackURL)) {
            const validFormats = ["JSON", "XML", "POST", "GET"];
            if (UsefulStuff.isEmpty(entity.WebhookCallbackFormat) ||
                !validFormats.includes(entity.WebhookCallbackFormat?.toUpperCase() ?? "")) {
                return { valid: false, error: "Missing or invalid WebhookCallbackFormat - JSON, XML, POST or GET" };
            }
        }
        if (!UsefulStuff.isEmpty(entity.SendTime) && !UsefulStuff.isDateTime(entity.SendTime as string)) {
            return { valid: false, error: "Unable to parse SendTime. Use YYYY-MM-DD hh:mm format." };
        }

        if (UsefulStuff.isEmpty(entity.Destinations)) {
            return { valid: false, error: "Empty Destination(s)" };
        }

        if (!UsefulStuff.isEmpty(entity.Files)) {
            for (let i = 0; i < entity.Files.length; i++) {
                if (UsefulStuff.isEmpty(entity.Files[i].Name)) {
                    return { valid: false, error: "Could not find attachment file name." };
                }
                if (UsefulStuff.isEmpty(entity.Files[i].Data)) {
                    return { valid: false, error: `Could not parse attachment file data ${entity.Files[i].Name}` };
                }
            }
        }

        if (!UsefulStuff.isEmpty(entity.Mode) && entity.Mode?.toUpperCase() !== "TEST") {
            return { valid: false, error: "Only Mode=Test is allowed" };
        }

        return { valid: true };
    }

    public AddRecipient(recipient: IAddRecipientArg<T['Destinations'][number]>): this {
        const targets = helpers.AddRecipient<T['Destinations'][number]>(recipient);
        if (!UsefulStuff.isEmpty(targets)) {
            this.entity.Destinations.push(...targets);
        }
        return this;
    }

    public AddAttachment(attachment: string): this {
        if (this.trackIfMissing(attachment)) {
            this.entity.Attachments.push(attachment);
        }
        return this;
    }

    /**
     * Checks a file path via FileHandler.fileExists(); if it doesn't exist, records it in
     * missingAttachments (surfaced as an error from the next SendMessage() call) instead of
     * silently dropping it. Returns whether the path exists, for the caller to decide what
     * to push onto `entity`.
     */
    protected trackIfMissing(path: string): boolean {
        if (FileHandler.fileExists(path)) {
            return true;
        }
        this.missingAttachments.push(path);
        return false;
    }
}
