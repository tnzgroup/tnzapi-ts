import { Map } from "../../../Functions/Mapper";
import { CommonListApiRequestDTO } from "../../../Common/dtos/CommonListApiRequestDTO";

export class StatusApiRequestDTO extends CommonListApiRequestDTO {
    MessageID?: string;
    Channel?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
