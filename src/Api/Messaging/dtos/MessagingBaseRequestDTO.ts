/** Base attachment shape shared by Email, Fax, and Voice general-attachment DTOs. `Data` is base64-encoded file content, always populated before the DTO is sent. */
export interface FileDTO {
    Name: string;
    Data: string;
}

/** Voice audio file — extends `FileDTO` with the local source path. `File` is consumed during `processAttachments` and is not part of the API contract. */
export interface VoiceFileDTO extends FileDTO {
    File?: string;
}

/** Shared keypad shape for TTS and Voice channel DTOs. `PlayFile` is only populated for Voice keypads (base64-encoded audio resolved from the source file). */
export interface KeypadDTO {
    Tone: number;
    RouteNumber?: string;
    Play?: string;
    PlaySection?: string;
    PlayFile?: string;
}

export class MessagingBaseRequestDTO {
    ReportTo?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: string;
    MessageID?: string;
    Reference?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    TemplateID?: string;
    NotificationType?: string;
    Destinations: any[] = [];
    Mode?: string;
}
