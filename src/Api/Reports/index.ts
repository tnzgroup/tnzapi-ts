import { SMSReceivedApi } from "./SMSReceivedApi";
import { SMSReplyApi } from "./SMSReplyApi";
import { StatusApi } from "./StatusApi";
import { ITNZAuthArgs } from "../../interfaces";

export class Reports {
    public SMSReceived: SMSReceivedApi;
    public SMSReply: SMSReplyApi;
    public Status: StatusApi;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: auth.URL || '' };

        this.SMSReceived = new SMSReceivedApi(args);
        this.SMSReply = new SMSReplyApi(args);
        this.Status = new StatusApi(args);
    }
}
