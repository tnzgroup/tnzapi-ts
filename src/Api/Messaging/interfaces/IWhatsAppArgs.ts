import { WebhookCallbackFormat, NotificationType, WhatsAppFallbackMode } from '../../../Common/enums/MessagingEnums';

export interface IWhatsAppDestination {
    ToNumber?: string;
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

export interface IWhatsAppArgs {
    Reference?: string;
    Message?: string;
    TemplateID?: string;
    FallbackMode?: WhatsAppFallbackMode;
    FromNumber?: string;
    Destinations?: IWhatsAppDestination[];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    ReportTo?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    NotificationType?: NotificationType;
    Mode?: 'Test';
    Attachments?: string[];
}