import { Map } from "../../../../Functions/Mapper";
import { ContactGroupBaseRequestDTO } from "./ContactGroupBaseRequestDTO";
import { GroupModel } from "../../Groups/models/GroupModel";

export class ContactGroupApiRequestDTO extends ContactGroupBaseRequestDTO {
    Group?: GroupModel;
    GroupID?: string;
    GroupCode?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }

    toJSON() {
        const copy = { ...this } as Record<string, unknown>;
        delete copy.ContactID;
        return copy;
    }
}
