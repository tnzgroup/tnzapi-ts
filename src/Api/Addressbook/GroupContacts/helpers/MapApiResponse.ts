import { UsefulStuff } from '../../../../Functions';
import { GroupContactApiResponseDTO } from '../dtos/GroupContactApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { GroupModel } from '../../Groups/models/GroupModel';
import { ContactModel } from '../../Contacts/models/ContactModel';

export const MapApiResponse = (responseData: any): GroupContactApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Group)) {
                responseData.Group = new GroupModel(responseData.Group);
            }
            if (!UsefulStuff.isEmpty(responseData.Contact)) {
                responseData.Contact = new ContactModel(responseData.Contact);
            }
            return new GroupContactApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
