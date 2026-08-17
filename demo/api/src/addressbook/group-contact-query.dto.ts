import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GroupContactListQueryDto {
    @IsString() groupID!: string;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) recordsPerPage?: number;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) page?: number;
}

export class GroupContactBodyDto {
    @IsString() GroupID!: string;
    @IsString() ContactID!: string;
}
