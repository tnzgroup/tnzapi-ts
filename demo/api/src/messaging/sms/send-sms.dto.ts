import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';
import { MessageAttachmentDto } from '../../common/message-attachment.dto';

export class SendSmsDto extends BaseMessagingDto {
    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() Message?: string;
    @IsOptional() @IsString() FromNumber?: string;
    @IsOptional() @IsString() SmsEmailReply?: string;
    @IsOptional() @IsBoolean() CharacterConversion?: boolean;
    @IsOptional() @IsArray() @IsString({ each: true }) FallbackMode?: string[];
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MessageAttachmentDto)
    Attachments?: MessageAttachmentDto[];
}
