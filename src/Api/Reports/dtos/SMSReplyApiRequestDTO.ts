import { Map } from "../../../Functions/Mapper";
import { CommonListApiRequestDTO } from "../../../Common/dtos/CommonListApiRequestDTO";

export class SMSReplyApiRequestDTO extends CommonListApiRequestDTO {
    MessageID?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
