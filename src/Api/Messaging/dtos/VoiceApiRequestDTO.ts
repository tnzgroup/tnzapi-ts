import { Map } from "../../../Functions/Mapper";
import { MessagingBaseRequestDTO, KeypadDTO, VoiceFileDTO } from "./MessagingBaseRequestDTO";

const VOICE_FILE_FIELDS = new Set([
    'MessageToPeople',
    'MessageToAnswerPhones',
    'CallRouteMessageToPeople',
    'CallRouteMessageToOperators',
    'CallRouteMessageOnWrongKey',
]);

export class VoiceApiRequestDTO extends MessagingBaseRequestDTO {
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
            // Map VoiceFiles entries to their named top-level fields (e.g. MessageToPeople).
            // Entries without a Name are ignored — there is no target field to assign.
            if (Array.isArray(data.VoiceFiles)) {
                for (const vf of data.VoiceFiles as VoiceFileDTO[]) {
                    if (vf.Name && VOICE_FILE_FIELDS.has(vf.Name)) {
                        (this as Record<string, unknown>)[vf.Name] = vf.Data;
                    }
                }
            }
            // VoiceFiles is not a spec field — do not serialize it
            delete (this as Record<string, unknown>).VoiceFiles;
        }
    }
}
