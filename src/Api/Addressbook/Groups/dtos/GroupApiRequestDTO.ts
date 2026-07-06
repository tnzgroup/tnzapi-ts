import { Map } from "../../../../Functions/Mapper";
import { CommonApiRequestDTO } from "../../../../Common/dtos/CommonApiRequestDTO";
import { GroupModel } from "../models/GroupModel";

export class GroupApiRequestDTO extends CommonApiRequestDTO {
    constructor(data?: any) {
        super();
        if (data) {
            const groupModelInstance = new GroupModel(data);
            Object.assign(this, groupModelInstance);
            Map(this, data);
        }
    }

    toJSON() {
        const copy = { ...this } as Record<string, unknown>;
        delete copy.GroupCode;
        return copy;
    }
}
