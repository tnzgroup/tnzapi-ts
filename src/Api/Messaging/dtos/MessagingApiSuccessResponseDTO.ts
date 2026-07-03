import { CommonApiResponseDTO } from "../../../Common/dtos";
import { Map } from "../../../Functions/Mapper";

export class MessagingApiSuccessResponseDTO extends CommonApiResponseDTO {
    MessageID?: string;
    JobNum?: string;
    Status?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
