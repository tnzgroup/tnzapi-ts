import { Map } from "../../Functions/Mapper";
import { Result } from "../Result";

export class ErrorResponseDTO {
    Result: Result.Error | Result.Failed | Result.Unauthorized = Result.Failed;
    ErrorMessage: string[] = [];

    constructor(data?: any) {
        if (data) {
            Map(this, data);
        }
    }
}