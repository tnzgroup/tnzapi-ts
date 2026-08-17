import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';

class TtsKeypadDto {
    @IsInt() Tone!: number;
    @IsOptional() @IsString() RouteNumber?: string;
    @IsOptional() @IsString() Play?: string;
    @IsOptional() @IsString() PlaySection?: string;
}

export class SendTtsDto extends BaseMessagingDto {
    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() GroupID?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() MessageToPeople?: string;
    @IsOptional() @IsString() MessageToAnswerPhones?: string;
    @IsOptional() @IsString() AnswerPhoneMode?: string;
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => TtsKeypadDto) Keypads?: TtsKeypadDto[];
    @IsOptional() @IsBoolean() KeypadOptionRequired?: boolean;
    @IsOptional() @IsString() CallRouteMessageOnWrongKey?: string;
    @IsOptional() @IsString() CallRouteMessageToPeople?: string;
    @IsOptional() @IsString() CallRouteMessageToOperators?: string;
    @IsOptional() @IsString() EndCallMessage?: string;
    @IsOptional() @IsInt() NumberOfOperators?: number;
    @IsOptional() @IsInt() RetryAttempts?: number;
    @IsOptional() @IsInt() RetryPeriod?: number;
    @IsOptional() @IsString() CallerId?: string;
    @IsOptional() @IsString() Voice?: string;
    @IsOptional() @IsString() Options?: string;
}
