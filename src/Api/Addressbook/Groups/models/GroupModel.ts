import { Map } from "../../../../Functions/Mapper";

export class GroupModel {
    GroupID?: string;
    GroupCode?: string;
    GroupName?: string;
    SubAccount?: string;
    Department?: string;
    Owner?: string;
    ViewEditBy?: string;
    AccessControl?: string;
    CreatedTimeLocal?: string;
    CreatedTimeUTC?: string;
    Timezone?: string;

    constructor(data?: any) {
        if (data) {
            if (data.Group) {
                Map(this, data.Group);
            } else {
                Map(this, data);
            }
        }
    }
}
