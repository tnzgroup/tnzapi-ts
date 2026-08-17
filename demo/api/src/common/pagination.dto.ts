import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// @Max(1000) here is a generic request-size sanity bound, not a reproduction of any one SDK
// method's exact limit — those vary per endpoint (e.g. Reports.Status.Poll and
// Reports.SMSReceived.Poll both cap RecordsPerPage at 999, not 1000) and are already enforced,
// with a proper error response, by each SDK method's own validate(). A value that passes this
// DTO but fails the SDK's tighter check still surfaces correctly via respondWithResult — this
// bound only exists to reject obviously-pathological input before it reaches the SDK at all.
export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    recordsPerPage?: number;
}
