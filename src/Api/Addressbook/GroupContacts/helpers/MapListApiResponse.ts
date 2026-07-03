import { UsefulStuff } from '../../../../Functions';
import { GroupContactListApiResponseDTO } from '../dtos/GroupContactListApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { GroupModel } from '../../Groups/models/GroupModel';
import { ContactModel } from '../../Contacts/models/ContactModel';

export const MapListApiResponse = (responseData: any): GroupContactListApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Group)) {
                responseData.Group = new GroupModel(responseData.Group);
            }
            if (!UsefulStuff.isEmpty(responseData.Contacts)) {
                let contacts: ContactModel[] = [];
                for (let contact of responseData.Contacts) {
                    contacts.push(new ContactModel(contact));
                }
                responseData.Contacts = contacts;
            }
            return new GroupContactListApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
