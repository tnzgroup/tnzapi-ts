import { Map } from "../../../Functions/Mapper";
import { ActionBaseRequestDTO } from "./ActionBaseRequestDTO";

export class PacingApiRequestDTO extends ActionBaseRequestDTO {
    NumberOfOperators: number = 0;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
