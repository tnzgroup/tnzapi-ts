import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";
import { IWorkflowDestination } from "../interfaces";

export class WorkflowModel extends CommonModel {
    WorkflowTemplateID?: string;
    ToNumber?: string;
    MainPhone?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IWorkflowDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}