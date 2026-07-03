import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO } from "./MessagingBaseRequestDTO";

export class WhatsAppApiRequestDTO extends MessagingBaseRequestDTO {
    FromNumber?: string;
    Message?: string;
    FallbackMode?: string;
    Files: any[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}