import { CommonApiResponseDTO } from "../../../../Common/dtos/CommonApiResponseDTO";
import { Map } from "../../../../Functions/Mapper";
import { ContactModel } from "../../Contacts/models/ContactModel";
import { GroupModel } from "../../Groups/models/GroupModel";

export class ContactGroupApiResponseDTO extends CommonApiResponseDTO {
    Contact?: ContactModel;
    Group?: GroupModel;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
