import { Map } from "../../../../Functions/Mapper";
import { CommonApiRequestDTO } from "../../../../Common/dtos/CommonApiRequestDTO";
import { ContactModel } from "../models/ContactModel";

export class ContactApiRequestDTO extends CommonApiRequestDTO {
    Contact?: ContactModel;

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
