import { UsefulStuff } from '../../../../Functions';
import { ContactListApiResponseDTO } from '../dtos/ContactListApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';

export const MapListApiResponse = (responseData: any): ContactListApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            return new ContactListApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
