import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, FileDTO } from "./MessagingBaseRequestDTO";

export class FaxApiRequestDTO extends MessagingBaseRequestDTO {
    Resolution?: string;
    CSID?: string;
    StampFormat?: string;
    WatermarkFolder?: string;
    WatermarkFirstPage?: string;
    WatermarkAllPages?: string;
    RetryAttempts?: number;
    RetryPeriod?: number;
    Files: FileDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
