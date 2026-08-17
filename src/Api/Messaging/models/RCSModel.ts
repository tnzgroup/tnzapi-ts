import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { IRCSDestination } from "../interfaces";

export class RCSModel extends CommonModel {
    FromNumber?: string;
    Message?: string;
    // string, not RCSFallbackMode: this may hold multiple values joined into a comma-separated
    // wire string (e.g. "SMS, Voice") by JoinFallbackMode — matches SMSModel/WhatsAppModel.
    FallbackMode?: string;
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