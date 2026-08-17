import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseMessagingDto } from '../../common/base-messaging.dto';

export class SendWorkflowDto extends BaseMessagingDto {
    @IsString()
    @IsNotEmpty()
    WorkflowTemplateId!: string;

    @IsOptional() @IsString() ToNumber?: string;
    @IsOptional() @IsString() MainPhone?: string;
    @IsOptional() @IsString() EmailAddress?: string;
    @IsOptional() @IsString() ContactIds?: string;
    @IsOptional() @IsString() GroupIds?: string;
}
