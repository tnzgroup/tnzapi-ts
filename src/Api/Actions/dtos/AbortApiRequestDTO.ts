import { Map } from "../../../Functions/Mapper";
import { ActionBaseRequestDTO } from "./ActionBaseRequestDTO";

export class AbortApiRequestDTO extends ActionBaseRequestDTO {
    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
