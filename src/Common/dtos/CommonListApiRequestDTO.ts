import { CommonApiRequestDTO } from "./CommonApiRequestDTO";

export class CommonListApiRequestDTO extends CommonApiRequestDTO {
    RecordsPerPage: number = 100;
    Page: number = 1;

    constructor(data?: any) {
        super(data);
    }
}
