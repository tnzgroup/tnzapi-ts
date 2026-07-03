import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { IEmailDestination } from "../interfaces";

export class EmailModel extends CommonModel {
    EmailSubject?: string;
    SMTPFrom?: string;
    From?: string;
    FromEmail?: string;
    CCEmail?: string;
    ReplyTo?: string;
    MessagePlain?: string;
    MessageHTML?: string;
    EmailAddress?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IEmailDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
