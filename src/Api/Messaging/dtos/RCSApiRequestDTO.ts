import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, FileDTO } from "./MessagingBaseRequestDTO";
import { RCSFallbackMode } from "../../../Common/enums/MessagingEnums";

export class RCSApiRequestDTO extends MessagingBaseRequestDTO {
    FromNumber?: string;
    Message?: string;
    FallbackMode?: RCSFallbackMode;
    Files: FileDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}