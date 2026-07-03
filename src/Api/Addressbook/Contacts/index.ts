import { ContactCreateApi } from "./ContactCreateApi";
import { ContactUpdateApi } from "./ContactUpdateApi";
import { ContactDeleteApi } from "./ContactDeleteApi";
import { ContactDetailApi } from "./ContactDetailApi";
import { ContactListApi } from "./ContactListApi";
import { ContactApiResponseDTO, ContactListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ITNZAuthArgs } from "../../../interfaces";
import { IContactCreateArgs, IContactUpdateArgs, IContactDeleteArgs, IContactDetailArgs, IContactListArgs } from "../interfaces";

export class Contact {
    public Create: (args?: IContactCreateArgs) => Promise<ContactApiResponseDTO | ErrorResponseDTO>;
    public Update: (args?: IContactUpdateArgs) => Promise<ContactApiResponseDTO | ErrorResponseDTO>;
    public Delete: (args?: IContactDeleteArgs) => Promise<ContactApiResponseDTO | ErrorResponseDTO>;
    public Detail: (args?: IContactDetailArgs) => Promise<ContactApiResponseDTO | ErrorResponseDTO>;
    public List: (args?: IContactListArgs) => Promise<ContactListApiResponseDTO | ErrorResponseDTO>;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: `${auth.URL}/contact` };

        const createApi = new ContactCreateApi(args);
        const updateApi = new ContactUpdateApi(args);
        const deleteApi = new ContactDeleteApi(args);
        const detailApi = new ContactDetailApi(args);
        const listApi = new ContactListApi(args);

        this.Create = createApi.Run.bind(createApi);
        this.Update = updateApi.Run.bind(updateApi);
        this.Delete = deleteApi.Run.bind(deleteApi);
        this.Detail = detailApi.Run.bind(detailApi);
        this.List = listApi.Run.bind(listApi);
    }
}