import { Map } from "../../../Functions/Mapper";

export class SMSReplyRecipientSMSReplyDTO {
    ReceivedID?: string;
    ReceivedTimeLocal?: string;
    ReceivedTimeUTC?: string;
    Timezone?: string;
    From?: string;
    MessageText?: string;

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}
