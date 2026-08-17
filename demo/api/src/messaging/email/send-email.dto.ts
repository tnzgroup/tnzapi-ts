import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';
import { MessageAttachmentDto } from '../../common/message-attachment.dto';

export class SendEmailDto extends BaseMessagingDto {
    @IsOptional() @IsString() EmailAddress?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    // Not @IsOptional(): tnzapi-ts's EmailApi.validate() unconditionally rejects a missing
    // EmailSubject (src/Api/Messaging/EmailApi.ts) with no TemplateID escape hatch, unlike the
    // message-body check right next to it — so this DTO enforces the same requirement up front
    // via ValidationPipe instead of letting the request reach the SDK and fail there.
    @IsString()
    @IsNotEmpty()
    Subject!: string;
    @IsOptional() @IsString() MessageHtml?: string;
    @IsOptional() @IsString() SmtpFrom?: string;
    @IsOptional() @IsString() From?: string;
    @IsOptional() @IsString() FromEmail?: string;
    @IsOptional() @IsString() CcEmail?: string;
    @IsOptional() @IsString() ReplyTo?: string;
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MessageAttachmentDto)
    Attachments?: MessageAttachmentDto[];
}
