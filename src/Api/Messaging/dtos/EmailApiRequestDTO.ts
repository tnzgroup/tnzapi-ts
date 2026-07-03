import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, FileDTO } from "./MessagingBaseRequestDTO";

export class EmailApiRequestDTO extends MessagingBaseRequestDTO {
    EmailSubject?: string;
    SMTPFrom?: string;
    From?: string;
    FromEmail?: string;
    CCEmail?: string;
    ReplyTo?: string;
    MessagePlain?: string;
    MessageHTML?: string;
    Files: FileDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
