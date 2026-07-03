import { WebhookCallbackFormat, NotificationType, AnswerPhoneMode } from '../../../Common/enums/MessagingEnums';

export interface IVoiceDestination {
    MainPhone?: string;
    Recipient?: string;
    Attention?: string;
    FirstName?: string;
    LastName?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
}

export interface IVoiceKeypad {
    Tone: number;
    RouteNumber?: string;
    Play?: string;
    PlayFile?: string;
    PlaySection?: string;
    File?: string;
}

export interface IVoiceFile {
    Name: string;
    File: string;
}

export interface IVoiceArgs {
    Reference?: string;
    MessageToPeople?: string;
    MessageToAnswerPhones?: string;
    TemplateID?: string;
    AnswerPhoneMode?: AnswerPhoneMode;
    Destinations?: IVoiceDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    ReportTo?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    NotificationType?: NotificationType;
    Mode?: 'Test';
    CallerID?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    NumberOfOperators?: number;
    KeypadOptionRequired?: boolean;
    CallRouteMessageOnWrongKey?: string;
    CallRouteMessageToPeople?: string;
    CallRouteMessageToOperators?: string;
    EndCallMessage?: string;
    Options?: string;
    VoiceFiles?: IVoiceFile[];
    Keypads?: IVoiceKeypad[];
}