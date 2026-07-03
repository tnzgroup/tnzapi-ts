import { Map } from "../../../../Functions/Mapper";
import { GroupModel } from "../../Groups/models/GroupModel";
import { ContactModel } from "../../Contacts/models/ContactModel";
import { CommonApiResponseDTO } from "../../../../Common/dtos";

export class GroupContactApiResponseDTO extends CommonApiResponseDTO {
    Group?: GroupModel;
    Contact?: ContactModel;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
