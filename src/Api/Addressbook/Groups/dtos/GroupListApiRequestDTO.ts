import { Map } from "../../../../Functions/Mapper";
import { CommonListApiRequestDTO } from "../../../../Common/dtos/CommonListApiRequestDTO";

export class GroupListApiRequestDTO extends CommonListApiRequestDTO {
    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
