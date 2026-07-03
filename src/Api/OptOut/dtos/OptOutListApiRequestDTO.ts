import { Map } from "../../../Functions/Mapper";

export class OptOutListApiRequestDTO {
    RecordsPerPage: number = 100;
    Page: number = 1;
    DestType?: string;
    TimePeriod?: number;
    ContactID?: string;

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}