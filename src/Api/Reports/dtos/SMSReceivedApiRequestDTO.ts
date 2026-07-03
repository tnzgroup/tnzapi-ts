import { Map } from "../../../Functions/Mapper";
import { CommonListApiRequestDTO } from "../../../Common/dtos/CommonListApiRequestDTO";

export class SMSReceivedApiRequestDTO extends CommonListApiRequestDTO {
    TimePeriod: number = 1440;
    DateFrom: string | null = null;
    DateTo: string | null = null;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
