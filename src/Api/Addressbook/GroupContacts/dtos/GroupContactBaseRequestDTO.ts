import { CommonApiRequestDTO } from "../../../../Common/dtos/CommonApiRequestDTO";
import { GroupModel } from "../../Groups/models/GroupModel";

export class GroupContactBaseRequestDTO extends CommonApiRequestDTO {
    Group?: GroupModel;
    GroupID?: string;
    GroupCode?: string;
}
