import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { KeypadDTO, FileDTO, VoiceFileDTO } from "../dtos";
import { IVoiceDestination } from "../interfaces";

export class VoiceModel extends CommonModel {
    CallerID?: string;
    BillingAccount?: string;
    RetryAttempts: number = 1;
    RetryPeriod: number = 1;
    MessageToPeople?: string;
    MessageToAnswerPhones?: string;
    CallRouteMessageToPeople?: string;
    CallRouteMessageToOperators?: string;
    CallRouteMessageOnWrongKey?: string;
    NumberOfOperators: number = 0;
    Voice?: string;
    AnswerPhoneMode?: string;
    EndCallMessage?: string;
    Options?: string;
    Keypads: (KeypadDTO & { File?: string })[] = [];
    KeypadOptionRequired: boolean = false;
    VoiceFiles: VoiceFileDTO[] = [];
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: IVoiceDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
