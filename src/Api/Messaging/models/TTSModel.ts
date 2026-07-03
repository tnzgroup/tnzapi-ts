import { Map } from "../../../Functions/Mapper";
import { CommonModel } from "./CommonModel";
import { KeypadDTO, FileDTO } from "../dtos";
import { ITTSDestination } from "../interfaces";

export class TTSModel extends CommonModel {
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
    Keypads: KeypadDTO[] = [];
    KeypadOptionRequired: boolean = false;
    ToNumber?: string;
    GroupID?: string;
    ContactID?: string;
    Destinations: ITTSDestination[] = [];
    Files: FileDTO[] = [];
    Attachments: string[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
