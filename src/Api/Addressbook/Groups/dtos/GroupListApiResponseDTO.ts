import { CommonApiResponseDTO } from "../../../../Common/dtos";
import { Map } from "../../../../Functions/Mapper";
import { GroupModel } from "../models/GroupModel";

export class GroupListApiResponseDTO extends CommonApiResponseDTO {
    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    Groups?: GroupModel[];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
