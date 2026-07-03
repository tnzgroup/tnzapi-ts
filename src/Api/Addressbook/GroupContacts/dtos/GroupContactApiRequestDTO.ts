import { Map } from "../../../../Functions/Mapper";
import { GroupContactBaseRequestDTO } from "./GroupContactBaseRequestDTO";
import { ContactModel } from "../../Contacts/models/ContactModel";

export class GroupContactApiRequestDTO extends GroupContactBaseRequestDTO {
    Contact?: ContactModel;
    ContactID?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
