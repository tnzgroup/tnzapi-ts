import { Map } from "../../../../Functions/Mapper";
import { CommonApiRequestDTO } from "../../../../Common/dtos/CommonApiRequestDTO";
import { ContactModel } from "../models/ContactModel";

export class ContactApiRequestDTO extends CommonApiRequestDTO {
    Contact?: ContactModel;

    constructor(data?: any) {
        super();
        if (data) {
            const contactModelInstance = new ContactModel(data);
            Object.assign(this, contactModelInstance);
            Map(this, data);
        }
    }

    toJSON() {
        const copy = { ...this };
        delete (copy as any).ContactID;
        return copy;
    }
}
