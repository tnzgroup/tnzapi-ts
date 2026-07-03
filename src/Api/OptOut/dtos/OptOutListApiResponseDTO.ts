import { Map } from "../../../Functions/Mapper";
import { CommonApiResponseDTO } from "../../../Common/dtos";
import { OptOutApiResponseDTO } from "./OptOutApiResponseDTO";

export class OptOutListApiResponseDTO extends CommonApiResponseDTO {
    TotalRecords?: number;
    RecordsPerPage?: number;
    PageCount?: number;
    Page?: number;
    // Populated by OptOutListApi.Run() from either the "OptOuts" or legacy
    // "Data" wire key — see the fallback there for context.
    OptOuts: OptOutApiResponseDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}