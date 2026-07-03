import { Map } from "../../../Functions/Mapper";

export class SMSReceivedDTO {
    ReceivedID?: string;
    MessageID?: string;
    JobNum?: string;
    SubAccount?: string;
    Department?: string;
    ReceivedTimeLocal?: string;
    ReceivedTimeUTC?: string;
    From?: string;
    ContactID?: string;
    MessageText?: string;
    Timezone?: string;

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}
