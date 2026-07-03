import { Map } from "../../../Functions/Mapper";
import { CommonListApiResponseDTO } from "../../../Common/dtos/CommonListApiResponseDTO";
import { SMSReceivedDTO } from "./SMSReceivedDTO";

export class SMSReceivedApiResponseDTO extends CommonListApiResponseDTO {
    Messages: SMSReceivedDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
