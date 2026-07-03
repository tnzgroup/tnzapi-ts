import { Map } from "../../../Functions/Mapper";
import { RecipientDTO } from "./RecipientDTO";
import { SMSReplyRecipientSMSReplyDTO } from "./SMSReplyRecipientSMSReplyDTO";

export class SMSReplyRecipientDTO extends RecipientDTO {
    SMSReplies: SMSReplyRecipientSMSReplyDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
            if (data.SMSReplies) {
                this.SMSReplies = data.SMSReplies.map((reply: any) => new SMSReplyRecipientSMSReplyDTO(reply));
            }
        }
    }
}
