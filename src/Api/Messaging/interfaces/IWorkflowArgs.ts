import { WebhookCallbackFormat } from '../../../Common/enums/MessagingEnums';

export interface IWorkflowDestination {
    ContactID?: string;
    GroupID?: string;
    GroupCode?: string;
    ToNumber?: string;
    EmailAddress?: string;
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
}

export interface IWorkflowArgs {
    Reference?: string;
    WorkflowTemplateID: string;
    Destinations?: IWorkflowDestination[];
    ToNumber?: string;
    MainPhone?: string;
    GroupID?: string;
    ContactID?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    MessageID?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: WebhookCallbackFormat;
    Mode?: 'Test';
}