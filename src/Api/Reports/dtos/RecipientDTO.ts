import { Map } from "../../../Functions/Mapper";

export class RecipientDTO {
    Type?: string;
    DestSeq?: number;
    Destination?: string;
    ContactID?: string;
    Status?: string;
    Result?: string;
    SentTimeLocal?: string;
    SentTimeUTC?: string;
    Attention?: string;
    Company?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Custom5?: string;
    Custom6?: string;
    Custom7?: string;
    Custom8?: string;
    Custom9?: string;
    RemoteID?: string;
    Price?: number;

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}
