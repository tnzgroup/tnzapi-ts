import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ContactGroupListQueryDto {
    @IsString() contactID!: string;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) recordsPerPage?: number;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) page?: number;
}

export class ContactGroupBodyDto {
    @IsString() ContactID!: string;
    @IsString() GroupID!: string;
}
