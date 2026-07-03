import { Map } from "../../../../Functions/Mapper";
import { GroupModel } from "../../Groups/models/GroupModel";
import { ContactModel } from "../../Contacts/models/ContactModel";
import { CommonApiResponseDTO } from "../../../../Common/dtos";

export class GroupContactListApiResponseDTO extends CommonApiResponseDTO {

    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    Group?: GroupModel;
    Contacts?: ContactModel[];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
