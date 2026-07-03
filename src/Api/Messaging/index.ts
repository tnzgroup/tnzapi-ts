import { EmailApi } from "./EmailApi";
import { SMSApi } from "./SMSApi";
import { FaxApi } from "./FaxApi";
import { TTSApi } from "./TTSApi";
import { VoiceApi } from "./VoiceApi";
import { WorkflowApi } from "./WorkflowApi";
import { WhatsAppApi } from "./WhatsAppApi";
import { RCSApi } from "./RCSApi";
import { ITNZAuthArgs } from "../../interfaces";

export class Messaging {
    public Email: EmailApi;
    public SMS: SMSApi;
    public Voice: VoiceApi;
    public Fax: FaxApi;
    public TTS: TTSApi;
    public Workflow: WorkflowApi;
    public WhatsApp: WhatsAppApi;
    public RCS: RCSApi;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: auth.URL || '' };

        this.Email = new EmailApi(args);
        this.SMS = new SMSApi(args);
        this.Fax = new FaxApi(args);
        this.Voice = new VoiceApi(args);
        this.TTS = new TTSApi(args);
        this.Workflow = new WorkflowApi(args);
        this.WhatsApp = new WhatsAppApi(args);
        this.RCS = new RCSApi(args);
    }
}
