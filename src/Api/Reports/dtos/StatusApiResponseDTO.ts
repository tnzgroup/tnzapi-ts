import { Map } from "../../../Functions/Mapper";
import { CommonApiResponseDTO } from "../../../Common/dtos/CommonApiResponseDTO";
import { RecipientDTO } from "./RecipientDTO";

export class StatusApiResponseDTO extends CommonApiResponseDTO {
    MessageID?: string;
    JobStatus?: string;
    JobNum?: string;
    Account?: string;
    SubAccount?: string;
    Department?: string;
    Reference?: string;
    CreatedTimeLocal?: string;
    CreatedTimeUTC?: string;
    DelayedTimeLocal?: string;
    DelayedTimeUTC?: string;
    Timezone?: string;
    Count?: number;
    Complete?: number;
    Success?: number;
    Failed?: number;
    Price?: number;
    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    Recipients: RecipientDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
