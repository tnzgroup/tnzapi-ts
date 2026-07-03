import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, KeypadDTO } from "./MessagingBaseRequestDTO";

export class TTSApiRequestDTO extends MessagingBaseRequestDTO {
    CallerID?: string;
    BillingAccount?: string;
    RetryAttempts: number = 1;
    RetryPeriod: number = 1;
    MessageToPeople?: string;
    MessageToAnswerPhones?: string;
    CallRouteMessageToPeople?: string;
    CallRouteMessageToOperators?: string;
    CallRouteMessageOnWrongKey?: string;
    KeypadOptionRequired?: boolean;
    NumberOfOperators: number = 0;
    Voice?: string;
    AnswerPhoneMode?: string;
    EndCallMessage?: string;
    Options?: string;
    Keypads: KeypadDTO[] = [];

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
