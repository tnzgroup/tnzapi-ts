import { UsefulStuff } from '../../../../Functions';
import { ContactGroupListApiResponseDTO } from '../dtos/ContactGroupListApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { ContactModel } from '../../Contacts/models/ContactModel';
import { GroupModel } from '../../Groups/models/GroupModel';

export const MapListApiResponse = (responseData: any): ContactGroupListApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Contact)) {
                responseData.Contact = new ContactModel(responseData.Contact);
            }
            if (!UsefulStuff.isEmpty(responseData.Groups)) {
                const groups: GroupModel[] = [];
                for (const group of responseData.Groups) {
                    groups.push(new GroupModel(group));
                }
                responseData.Groups = groups;
            }
            return new ContactGroupListApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
