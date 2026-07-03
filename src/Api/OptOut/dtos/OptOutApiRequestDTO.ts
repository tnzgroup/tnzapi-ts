import { Map } from "../../../Functions/Mapper";
import { OptOutModel } from "../models/OptOutModel";

export class OptOutApiRequestDTO extends OptOutModel {
    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}