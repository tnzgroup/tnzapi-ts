import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { ISMSDestination } from "../interfaces";

export class SMSModel extends CommonModel {
    FromNumber?: string;
    SMSEmailReply?: string;
    CharacterConversion?: boolean;
    Message?: string;
    FallbackMode?: string;
    ReplyLink?: boolean;
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: ISMSDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
