import { Result } from "../Result";

export class CommonListApiResponseDTO {
    Result: Result.Success = Result.Success;
    TotalRecords: number = 0;
    RecordsPerPage: number = 100;
    PageCount: number = 1;
    Page: number = 1;
}
