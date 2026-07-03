import { GroupCreateApi } from "./GroupCreateApi";
import { GroupUpdateApi } from "./GroupUpdateApi";
import { GroupDeleteApi } from "./GroupDeleteApi";
import { GroupDetailApi } from "./GroupDetailApi";
import { GroupListApi } from "./GroupListApi";
import { GroupApiResponseDTO, GroupListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../../Common/dtos";
import { ITNZAuthArgs } from "../../../interfaces";
import { IGroupCreateArgs, IGroupUpdateArgs, IGroupDeleteArgs, IGroupDetailArgs, IGroupListArgs } from "../interfaces";

export class Group {
    public Create: (args?: IGroupCreateArgs) => Promise<GroupApiResponseDTO | ErrorResponseDTO>;
    public Update: (args?: IGroupUpdateArgs) => Promise<GroupApiResponseDTO | ErrorResponseDTO>;
    public Delete: (args?: IGroupDeleteArgs) => Promise<GroupApiResponseDTO | ErrorResponseDTO>;
    public Detail: (args?: IGroupDetailArgs) => Promise<GroupApiResponseDTO | ErrorResponseDTO>;
    public List: (args?: IGroupListArgs) => Promise<GroupListApiResponseDTO | ErrorResponseDTO>;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: `${auth.URL}/group` };

        const createApi = new GroupCreateApi(args);
        const updateApi = new GroupUpdateApi(args);
        const deleteApi = new GroupDeleteApi(args);
        const detailApi = new GroupDetailApi(args);
        const listApi = new GroupListApi(args);

        this.Create = createApi.Run.bind(createApi);
        this.Update = updateApi.Run.bind(updateApi);
        this.Delete = deleteApi.Run.bind(deleteApi);
        this.Detail = detailApi.Run.bind(detailApi);
        this.List = listApi.Run.bind(listApi);
    }
}