import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';
import { MessageAttachmentDto } from '../../common/message-attachment.dto';

export class SendFaxDto extends BaseMessagingDto {
    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() Csid?: string;
    @IsOptional() @IsString() CallerId?: string;
    @IsOptional() @IsString() Resolution?: string;
    @IsOptional() @IsString() WatermarkFolder?: string;
    @IsOptional() @IsString() WatermarkFirstPage?: string;
    @IsOptional() @IsString() WatermarkAllPages?: string;
    @IsOptional() @IsInt() RetryAttempts?: number;
    @IsOptional() @IsInt() RetryPeriod?: number;
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MessageAttachmentDto)
    Attachments?: MessageAttachmentDto[];
}
