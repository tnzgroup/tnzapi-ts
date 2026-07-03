import { CommonApiRequestDTO } from "../../../Common/dtos/CommonApiRequestDTO";

export class ActionBaseRequestDTO extends CommonApiRequestDTO {
    MessageID?: string;
    Channel?: string;
}
