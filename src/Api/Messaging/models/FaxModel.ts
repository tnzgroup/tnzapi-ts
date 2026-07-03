import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { IFaxDestination } from "../interfaces";

export class FaxModel extends CommonModel {
    Resolution?: string;
    CSID?: string;
    StampFormat?: string;
    WatermarkFolder?: string;
    WatermarkFirstPage?: string;
    WatermarkAllPages?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IFaxDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
