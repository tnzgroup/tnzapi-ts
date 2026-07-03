import { Map } from "../../../Functions/Mapper";

export class OptOutModel {
    OptOutID?: string;
    Destination?: string;
    DestType?: string;
    Department?: string;
    SubAccount?: string;
    ContactID?: string;
    StopMessage?: string;
    Notes?: string;

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}