import { CommonListApiRequestDTO } from "../../../../Common/dtos/CommonListApiRequestDTO";
import { GroupModel } from "../../Groups/models/GroupModel";

export class BaseListApiRequestDTO extends CommonListApiRequestDTO {
    Group?: GroupModel;
    GroupID?: string;
    GroupCode?: string;
}
