import { UsefulStuff } from '../../../../Functions';
import { ContactGroupApiResponseDTO } from '../dtos/ContactGroupApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { ContactModel } from '../../Contacts/models/ContactModel';
import { GroupModel } from '../../Groups/models/GroupModel';

export const MapApiResponse = (responseData: any): ContactGroupApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Contact)) {
                responseData.Contact = new ContactModel(responseData.Contact);
            }
            if (!UsefulStuff.isEmpty(responseData.Group)) {
                responseData.Group = new GroupModel(responseData.Group);
            }
            return new ContactGroupApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
