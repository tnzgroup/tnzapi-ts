import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { RCSFallbackMode } from "../../../Common/enums/MessagingEnums";
import { IRCSDestination } from "../interfaces";

export class RCSModel extends CommonModel {
    FromNumber?: string;
    Message?: string;
    FallbackMode?: RCSFallbackMode;
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IRCSDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}