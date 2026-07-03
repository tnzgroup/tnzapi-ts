import { CommonApiResponseDTO } from "../../../../Common/dtos/CommonApiResponseDTO";
import { Map } from "../../../../Functions/Mapper";
import { ContactModel } from "../models/ContactModel";

export class ContactApiResponseDTO extends CommonApiResponseDTO {
    Contact?: ContactModel;

    constructor(data?: any) {
        super();
        if (data) {
            Map(this, data);
        }
    }
}
