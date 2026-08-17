import { IsOptional, IsString } from 'class-validator';

export class GroupFieldsDto {
    @IsOptional() @IsString() GroupName?: string;
    @IsOptional() @IsString() ViewEditBy?: string;
    @IsOptional() @IsString() SubAccount?: string;
    @IsOptional() @IsString() Department?: string;
}
