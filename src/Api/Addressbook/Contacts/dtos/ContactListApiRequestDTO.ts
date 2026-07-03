import { Map } from "../../../../Functions/Mapper";
import { CommonListApiRequestDTO } from "../../../../Common/dtos/CommonListApiRequestDTO";
import { ContactModel } from "../models/ContactModel";

export class ContactListApiRequestDTO extends CommonListApiRequestDTO {
    constructor(data?: any) {
        super(data);
        if (data) {
            const contactModelInstance = new ContactModel(data);
            Object.assign(this, contactModelInstance);
            Map(this, data);
        }
    }
}
