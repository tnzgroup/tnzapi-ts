import { OptOutListApi } from "./OptOutListApi";
import { OptOutCreateApi } from "./OptOutCreateApi";
import { OptOutDetailApi } from "./OptOutDetailApi";
import { OptOutDeleteApi } from "./OptOutDeleteApi";
import { OptOutApiResponseDTO, OptOutListApiResponseDTO } from "./dtos";
import { ErrorResponseDTO } from "../../Common/dtos";
import { ITNZAuthArgs } from "../../interfaces";
import { IOptOutCreateArgs, IOptOutDetailArgs, IOptOutDeleteArgs, IOptOutListArgs } from "./interfaces";

export class OptOut {
    public List: (args?: IOptOutListArgs) => Promise<OptOutListApiResponseDTO | ErrorResponseDTO>;
    public Create: (args?: IOptOutCreateArgs) => Promise<OptOutApiResponseDTO | ErrorResponseDTO>;
    public Detail: (args?: IOptOutDetailArgs) => Promise<OptOutApiResponseDTO | ErrorResponseDTO>;
    public Delete: (args?: IOptOutDeleteArgs) => Promise<OptOutApiResponseDTO | ErrorResponseDTO>;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: auth.URL || '' };

        const listApi = new OptOutListApi(args);
        const createApi = new OptOutCreateApi(args);
        const detailApi = new OptOutDetailApi(args);
        const deleteApi = new OptOutDeleteApi(args);

        this.List = listApi.Run.bind(listApi);
        this.Create = createApi.Run.bind(createApi);
        this.Detail = detailApi.Run.bind(detailApi);
        this.Delete = deleteApi.Run.bind(deleteApi);
    }
}