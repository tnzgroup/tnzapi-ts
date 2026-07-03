import { CommonApiResponseDTO } from "../../../../Common/dtos";
import { Map } from "../../../../Functions/Mapper";
import { GroupModel } from "../models/GroupModel";

export class GroupApiResponseDTO extends CommonApiResponseDTO {
    Group?: GroupModel;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
