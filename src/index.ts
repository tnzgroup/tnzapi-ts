import { Messaging } from './Api/Messaging';
import { Reports } from './Api/Reports';
import { Actions } from './Api/Actions';
import { Addressbook } from './Api/Addressbook';
import { OptOut } from './Api/OptOut';
import { ITNZAuthArgs } from './interfaces';

export * from './Common/enums/MessagingEnums';
export { ErrorResponseDTO } from './Common/dtos';
export type { ITNZAuthArgs };

// Request argument interfaces
export type * from './Api/Messaging/interfaces';
export type * from './Api/Reports/interfaces';
export type * from './Api/Actions/interfaces';
export type * from './Api/Addressbook/interfaces';
export type * from './Api/OptOut/interfaces';

// Success response DTOs
export type { MessagingApiSuccessResponseDTO } from './Api/Messaging/dtos';
export type { StatusApiResponseDTO } from './Api/Reports/dtos/StatusApiResponseDTO';
export type { SMSReplyApiResponseDTO } from './Api/Reports/dtos/SMSReplyApiResponseDTO';
export type { SMSReceivedApiResponseDTO } from './Api/Reports/dtos/SMSReceivedApiResponseDTO';
export type { ActionApiResponseDTO } from './Api/Actions/dtos/ActionApiResponseDTO';
export type { ContactApiResponseDTO } from './Api/Addressbook/Contacts/dtos/ContactApiResponseDTO';
export type { ContactListApiResponseDTO } from './Api/Addressbook/Contacts/dtos/ContactListApiResponseDTO';
export type { GroupApiResponseDTO } from './Api/Addressbook/Groups/dtos/GroupApiResponseDTO';
export type { GroupListApiResponseDTO } from './Api/Addressbook/Groups/dtos/GroupListApiResponseDTO';
export type { ContactGroupApiResponseDTO } from './Api/Addressbook/ContactGroups/dtos/ContactGroupApiResponseDTO';
export type { ContactGroupListApiResponseDTO } from './Api/Addressbook/ContactGroups/dtos/ContactGroupListApiResponseDTO';
export type { GroupContactApiResponseDTO } from './Api/Addressbook/GroupContacts/dtos/GroupContactApiResponseDTO';
export type { GroupContactListApiResponseDTO } from './Api/Addressbook/GroupContacts/dtos/GroupContactListApiResponseDTO';
export type { OptOutApiResponseDTO } from './Api/OptOut/dtos/OptOutApiResponseDTO';
export type { OptOutListApiResponseDTO } from './Api/OptOut/dtos/OptOutListApiResponseDTO';

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
