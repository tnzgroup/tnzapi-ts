import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';
import { MessageAttachmentDto } from '../../common/message-attachment.dto';

export class SendWhatsappDto extends BaseMessagingDto {
    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() Message?: string;
    @IsOptional() @IsString() FromNumber?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) FallbackMode?: string[];
    @IsOptional() @IsString() Custom1?: string;
    @IsOptional() @IsString() Custom2?: string;
    @IsOptional() @IsString() Custom3?: string;
    @IsOptional() @IsString() Custom4?: string;
    @IsOptional() @IsString() Custom5?: string;
    @IsOptional() @IsString() Custom6?: string;
    @IsOptional() @IsString() Custom7?: string;
    @IsOptional() @IsString() Custom8?: string;
    @IsOptional() @IsString() Custom9?: string;
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MessageAttachmentDto)
    Attachments?: MessageAttachmentDto[];
}
