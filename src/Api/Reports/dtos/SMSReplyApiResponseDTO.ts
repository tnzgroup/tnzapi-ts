import { Map } from "../../../Functions/Mapper";
import { CommonListApiResponseDTO } from "../../../Common/dtos/CommonListApiResponseDTO";
import { SMSReplyRecipientDTO } from "./SMSReplyRecipientDTO";

export class SMSReplyApiResponseDTO extends CommonListApiResponseDTO {
    MessageID?: string;
    JobStatus?: string;
    JobNum?: string;
    Account?: string;
    SubAccount?: string;
    Department?: string;
    Reference?: string;
    CreatedTimeLocal?: string;
    CreatedTimeUTC?: string;
    DelayedTimeLocal?: string;
    DelayedTimeUTC?: string;
    Timezone?: string;
    Count: number = 0;
    Complete: number = 0;
    Success: number = 0;
    Failed: number = 0;
    Price: number = 0;
    Recipients: SMSReplyRecipientDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
            if (data.Recipients) {
                this.Recipients = data.Recipients.map((recipient: any) => new SMSReplyRecipientDTO(recipient));
            }
        }
    }
}
