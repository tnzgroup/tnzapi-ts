import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class ReceivedQueryDto extends PaginationQueryDto {
    @IsOptional() @Type(() => Number) @IsInt() timePeriod?: number;
    @IsOptional() @IsString() dateFrom?: string;
    @IsOptional() @IsString() dateTo?: string;
}
