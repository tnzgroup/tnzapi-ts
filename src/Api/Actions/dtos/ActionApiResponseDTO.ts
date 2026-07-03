import { Map } from "../../../Functions/Mapper";
import { CommonApiResponseDTO } from "../../../Common/dtos/CommonApiResponseDTO";

export class ActionApiResponseDTO extends CommonApiResponseDTO {
    MessageID?: string;
    Status?: string;
    JobNum?: string;
    Action?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
