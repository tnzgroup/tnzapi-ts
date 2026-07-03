import { ContactGroupCreateApi } from "./ContactGroupCreateApi";
import { ContactGroupDeleteApi } from "./ContactGroupDeleteApi";
import { ContactGroupDetailApi } from "./ContactGroupDetailApi";
import { ContactGroupListApi } from "./ContactGroupListApi";
import { ContactGroupApiResponseDTO, ContactGroupListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ITNZAuthArgs } from "../../../interfaces";
import { IContactGroupArgs, IContactGroupListArgs } from "../interfaces";

export class ContactGroup {
    public Create: (args?: IContactGroupArgs) => Promise<ContactGroupApiResponseDTO | ErrorResponseDTO>;
    public Delete: (args?: IContactGroupArgs) => Promise<ContactGroupApiResponseDTO | ErrorResponseDTO>;
    public Detail: (args?: IContactGroupArgs) => Promise<ContactGroupApiResponseDTO | ErrorResponseDTO>;
    public List: (args?: IContactGroupListArgs) => Promise<ContactGroupListApiResponseDTO | ErrorResponseDTO>;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: `${auth.URL}/contact` };

        const createApi = new ContactGroupCreateApi(args);
        const deleteApi = new ContactGroupDeleteApi(args);
        const detailApi = new ContactGroupDetailApi(args);
        const listApi = new ContactGroupListApi(args);

        this.Create = createApi.Run.bind(createApi);
        this.Delete = deleteApi.Run.bind(deleteApi);
        this.Detail = detailApi.Run.bind(detailApi);
        this.List = listApi.Run.bind(listApi);
    }
}