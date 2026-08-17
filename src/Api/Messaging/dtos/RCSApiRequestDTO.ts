import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, FileDTO } from "./MessagingBaseRequestDTO";

export class RCSApiRequestDTO extends MessagingBaseRequestDTO {
    FromNumber?: string;
    Message?: string;
    // string, not RCSFallbackMode — see RCSModel.ts's comment on the same field.
    FallbackMode?: string;
    Files: FileDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}