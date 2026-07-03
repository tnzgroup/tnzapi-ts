import { IMessagingDestination } from "../interfaces";

export class CommonModel {
    MessageID?: string;
    Reference?: string;
    ReportTo?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    TemplateID?: string;
    NotificationType?: string;
    Mode?: string;
    Destinations!: IMessagingDestination[];
}