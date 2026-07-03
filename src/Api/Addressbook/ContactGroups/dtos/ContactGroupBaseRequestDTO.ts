import { CommonApiRequestDTO } from "../../../../Common/dtos/CommonApiRequestDTO";
import { ContactModel } from "../../Contacts/models/ContactModel";

export class ContactGroupBaseRequestDTO extends CommonApiRequestDTO {
    Contact?: ContactModel;
    ContactID?: string;
}
