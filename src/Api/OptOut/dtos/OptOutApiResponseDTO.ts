import { Map } from "../../../Functions/Mapper";
import { CommonApiResponseDTO } from "../../../Common/dtos";

export class OptOutApiResponseDTO extends CommonApiResponseDTO {
    ID?: string;
    Destination?: string;
    DestType?: string;
    ContactID?: string;
    Department?: string;
    SubAccount?: string;
    StopMessage?: string;
    Notes?: string;
    OriginalMessage?: string;
    CreatedTimeLocal?: string;
    CreatedTimeUTC?: string;
    CreatedTimeUTC_RFC3339?: string;
    UpdatedTimeLocal?: string;
    UpdatedTimeUTC?: string;
    UpdatedTimeUTC_RFC3339?: string;
    Timezone?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}