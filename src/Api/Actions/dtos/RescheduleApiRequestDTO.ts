import { Map } from "../../../Functions/Mapper";
import { ActionBaseRequestDTO } from "./ActionBaseRequestDTO";

export class RescheduleApiRequestDTO extends ActionBaseRequestDTO {
    SendTime?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
