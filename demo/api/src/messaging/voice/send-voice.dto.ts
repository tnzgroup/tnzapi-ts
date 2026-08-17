import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';

class VoiceKeypadDto {
    @IsInt() Tone!: number;
    @IsOptional() @IsString() RouteNumber?: string;
    @IsOptional() @IsString() Play?: string;
    @IsOptional() @IsString() PlaySection?: string;
    @IsOptional() @IsString() PlayFile?: string;
}

export class SendVoiceDto extends BaseMessagingDto {
    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() MessageToPeople?: string;
    @IsOptional() @IsString() MessageToAnswerPhones?: string;
    @IsOptional() @IsString() AnswerPhoneMode?: string;
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VoiceKeypadDto) Keypads?: VoiceKeypadDto[];
    @IsOptional() @IsBoolean() KeypadOptionRequired?: boolean;
    @IsOptional() @IsString() CallRouteMessageOnWrongKey?: string;
    @IsOptional() @IsString() CallRouteMessageToPeople?: string;
    @IsOptional() @IsString() CallRouteMessageToOperators?: string;
    @IsOptional() @IsString() EndCallMessage?: string;
    @IsOptional() @IsInt() NumberOfOperators?: number;
    @IsOptional() @IsInt() RetryAttempts?: number;
    @IsOptional() @IsInt() RetryPeriod?: number;
    @IsOptional() @IsString() CallerId?: string;
    @IsOptional() @IsString() Options?: string;
}
