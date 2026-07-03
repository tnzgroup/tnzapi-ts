import { Map } from "../../../../Functions/Mapper";
import { BaseListApiRequestDTO } from "./BaseListApiRequestDTO";

export class ContactGroupListApiRequestDTO extends BaseListApiRequestDTO {
    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
