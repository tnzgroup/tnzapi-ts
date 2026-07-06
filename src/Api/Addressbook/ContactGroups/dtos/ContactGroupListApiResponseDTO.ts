import { CommonApiResponseDTO } from "../../../../Common/dtos/CommonApiResponseDTO";
import { Map } from "../../../../Functions/Mapper";
import { ContactModel } from "../../Contacts/models/ContactModel";
import { GroupModel } from "../../Groups/models/GroupModel";

export class ContactGroupListApiResponseDTO extends CommonApiResponseDTO {
    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    Contact?: ContactModel;
    Groups?: GroupModel[];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
