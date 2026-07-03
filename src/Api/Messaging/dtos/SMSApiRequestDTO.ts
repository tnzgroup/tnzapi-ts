import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO } from "./MessagingBaseRequestDTO";

export class SMSApiRequestDTO extends MessagingBaseRequestDTO {
    FromNumber?: string;
    SMSEmailReply?: string;
    CharacterConversion: boolean = false;
    Message?: string;
    FallbackMode?: string;
    ReplyLink?: boolean;
    Files: any[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
