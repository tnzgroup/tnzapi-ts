import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../common/pagination.dto';

export class OptOutListQueryDto extends PaginationQueryDto {
    @IsOptional() @IsString() destType?: string;
    @IsOptional() @Type(() => Number) @IsInt() timePeriod?: number;
    @IsOptional() @IsString() contactID?: string;
}
