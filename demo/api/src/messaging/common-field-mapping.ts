import { BaseMessagingDto } from '../common/base-messaging.dto';
import { stripUndefined } from '../common/strip-undefined';

export interface SdkCommonFields {
    Reference?: string;
    TemplateID?: string;
    NotificationType?: string;
    WebhookCallbackURL?: string;
    WebhookCallbackFormat?: string;
    ReportTo?: string;
    SendTime?: string;
    Timezone?: string;
    SubAccount?: string;
    Department?: string;
    ChargeCode?: string;
    Mode?: 'Test';
}

// None of these fields currently have a non-undefined default on the SDK's CommonModel (see
// Task 2's stripUndefined note — that pitfall only bites fields with real defaults, like
// pagination's RecordsPerPage/Page), so passing an explicit `undefined` here is harmless today.
// stripUndefined() is still applied before returning, so this stays true even if a future SDK
// version adds a default to one of these fields — the alternative is re-auditing every field
// here by hand whenever the SDK changes, which is exactly the kind of thing that gets missed.
export function toSdkCommonFields(dto: BaseMessagingDto): SdkCommonFields {
    return stripUndefined({
        Reference: dto.Reference,
        TemplateID: dto.TemplateId,
        NotificationType: dto.NotificationType,
        WebhookCallbackURL: dto.WebhookCallbackUrl,
        WebhookCallbackFormat: dto.WebhookCallbackFormat,
        ReportTo: dto.ReportTo,
        SendTime: dto.SendTime,
        Timezone: dto.Timezone,
        SubAccount: dto.SubAccount,
        Department: dto.Department,
        ChargeCode: dto.ChargeCode,
        Mode: dto.SendMode === 'Test' ? 'Test' : undefined,
    });
}
