import { WebhookCallbackFormat, NotificationType, SMSFallbackMode } from '../../../Common/enums/MessagingEnums';

export interface ISMSDestination {
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

export interface ISMSArgs {
    Reference?: string;
    Message?: string;
    TemplateID?: string;
    Destinations?: ISMSDestination[];
    /** Single-recipient shorthand for Destinations: [{ ToNumber }]. Comma-separated values create multiple destinations. */
    ToNumber?: string;
    /** Single-recipient shorthand for Destinations: [{ GroupID }]. Comma-separated values create multiple destinations. */
    GroupID?: string;
    /** Single-recipient shorthand for Destinations: [{ ContactID }]. Comma-separated values create multiple destinations. */
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
    FallbackMode?: SMSFallbackMode | SMSFallbackMode[];
    SMSEmailReply?: string;
    CharacterConversion?: boolean;
}