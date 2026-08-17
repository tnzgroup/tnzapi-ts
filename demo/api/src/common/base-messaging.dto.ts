import { IsOptional, IsString } from 'class-validator';

export abstract class BaseMessagingDto {
    @IsOptional() @IsString() Reference?: string;
    @IsOptional() @IsString() TemplateId?: string;
    @IsOptional() @IsString() NotificationType?: string;
    @IsOptional() @IsString() WebhookCallbackUrl?: string;
    @IsOptional() @IsString() WebhookCallbackFormat?: string;
    @IsOptional() @IsString() ReportTo?: string;
    @IsOptional() @IsString() SendTime?: string;
    @IsOptional() @IsString() Timezone?: string;
    @IsOptional() @IsString() SubAccount?: string;
    @IsOptional() @IsString() Department?: string;
    // Unlike the Python reference demo (which silently drops this — no equivalent field in that
    // SDK), tnzapi-ts's CommonModel actually carries ChargeCode through to the wire, so this DOES
    // get forwarded — see Task 6's toSdkCommonFields().
    @IsOptional() @IsString() ChargeCode?: string;
    @IsOptional() @IsString() SendMode?: string;
}
