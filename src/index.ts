import { Messaging } from './Api/Messaging';
import { Reports } from './Api/Reports';
import { Actions } from './Api/Actions';
import { Addressbook } from './Api/Addressbook';
import { OptOut } from './Api/OptOut';
import { ITNZAuthArgs } from './interfaces';

export * from './Common/enums/MessagingEnums';
export { ErrorResponseDTO } from './Common/dtos';
export type { ITNZAuthArgs };

export class TNZAPI {
    public Messaging: Messaging;
    public Reports: Reports;
    public Actions: Actions;
    public Addressbook: Addressbook;
    public OptOut: OptOut;

    constructor(args?: ITNZAuthArgs) {
        const authToken = args?.AuthToken || process.env.TNZ_AUTH_TOKEN;
        if (!authToken) {
            throw new Error('TNZ AuthToken is required. Pass it as AuthToken or set the TNZ_AUTH_TOKEN environment variable.');
        }

        const authArgs: ITNZAuthArgs = {
            AuthToken: authToken,
            URL: args?.URL || process.env.TNZ_API_URL || "https://api.tnz.co.nz/api/v3.00"
        };

        this.Messaging = new Messaging(authArgs);
        this.Reports = new Reports(authArgs);
        this.Actions = new Actions(authArgs);
        this.Addressbook = new Addressbook(authArgs);
        this.OptOut = new OptOut(authArgs);
    }
}
