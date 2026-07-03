import { AbortApi } from "./AbortApi";
import { PacingApi } from "./PacingApi";
import { ResubmitApi } from "./ResubmitApi";
import { RescheduleApi } from "./RescheduleApi";
import { ITNZAuthArgs } from "../../interfaces";

export class Actions {
    public Abort: AbortApi;
    public Pacing: PacingApi;
    public Resubmit: ResubmitApi;
    public Reschedule: RescheduleApi;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: auth.URL || '' };

        this.Abort = new AbortApi(args);
        this.Pacing = new PacingApi(args);
        this.Resubmit = new ResubmitApi(args);
        this.Reschedule = new RescheduleApi(args);
    }
}
