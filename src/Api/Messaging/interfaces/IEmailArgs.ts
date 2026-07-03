import { WebhookCallbackFormat, NotificationType } from '../../../Common/enums/MessagingEnums';

export interface IEmailDestination {
    EmailAddress?: string;
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

export interface IEmailArgs {
    Reference?: string;
    EmailSubject: string;
    MessagePlain?: string;
    MessageHTML?: string;
    TemplateID?: string;
    SMTPFrom?: string;
    From?: string;
    FromEmail?: string;
    CCEmail?: string;
    BCCEmail?: string;
    ReplyTo?: string;
    Destinations?: IEmailDestination[];
    EmailAddress?: string;
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
    Attachments?: string[];
}