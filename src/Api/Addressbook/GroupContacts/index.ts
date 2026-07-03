import { GroupContactCreateApi } from "./GroupContactCreateApi";
import { GroupContactDeleteApi } from "./GroupContactDeleteApi";
import { GroupContactDetailApi } from "./GroupContactDetailApi";
import { GroupContactListApi } from "./GroupContactListApi";
import { GroupContactApiResponseDTO, GroupContactListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ITNZAuthArgs } from "../../../interfaces";
import { IGroupContactArgs, IGroupContactListArgs } from "../interfaces";

export class GroupContact {
    public Create: (args?: IGroupContactArgs) => Promise<GroupContactApiResponseDTO | ErrorResponseDTO>;
    public Delete: (args?: IGroupContactArgs) => Promise<GroupContactApiResponseDTO | ErrorResponseDTO>;
    public Detail: (args?: IGroupContactArgs) => Promise<GroupContactApiResponseDTO | ErrorResponseDTO>;
    public List: (args?: IGroupContactListArgs) => Promise<GroupContactListApiResponseDTO | ErrorResponseDTO>;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: `${auth.URL}/group` };

        const createApi = new GroupContactCreateApi(args);
        const deleteApi = new GroupContactDeleteApi(args);
        const detailApi = new GroupContactDetailApi(args);
        const listApi = new GroupContactListApi(args);

        this.Create = createApi.Run.bind(createApi);
        this.Delete = deleteApi.Run.bind(deleteApi);
        this.Detail = detailApi.Run.bind(detailApi);
        this.List = listApi.Run.bind(listApi);
    }
}
