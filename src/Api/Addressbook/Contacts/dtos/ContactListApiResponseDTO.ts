import { CommonApiResponseDTO } from "../../../../Common/dtos/CommonApiResponseDTO";
import { Map } from "../../../../Functions/Mapper";
import { ContactModel } from "../models/ContactModel";

export class ContactListApiResponseDTO extends CommonApiResponseDTO {

    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    Contacts: ContactModel[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            
            Map(this, data);
            if (data.Contacts) {
                this.Contacts = data.Contacts.map((contact: any) => new ContactModel(contact));
            }
        }
    }
}
