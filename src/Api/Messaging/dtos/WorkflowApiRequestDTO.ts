import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO } from "./MessagingBaseRequestDTO";

export class WorkflowApiRequestDTO extends MessagingBaseRequestDTO {
    WorkflowTemplateID?: string;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
