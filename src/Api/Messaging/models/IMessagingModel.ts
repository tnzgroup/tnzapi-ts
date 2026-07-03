import { CommonModel } from "./CommonModel";
import { FileDTO } from "../dtos";

export interface IMessagingModel extends CommonModel {
    Files: FileDTO[];
    Attachments: string[];
}
