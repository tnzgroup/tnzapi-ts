import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { IWhatsAppDestination } from "../interfaces";

export class WhatsAppModel extends CommonModel {
    FromNumber?: string;
    Message?: string;
    FallbackMode?: string;
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IWhatsAppDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}