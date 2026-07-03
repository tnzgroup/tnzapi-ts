import { UsefulStuff } from '../../../../Functions';
import { ContactApiResponseDTO } from '../dtos/ContactApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { ContactModel } from '../models/ContactModel';

export const MapApiResponse = (responseData: any): ContactApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Contact)) {
                responseData.Contact = new ContactModel(responseData.Contact);
            }
            return new ContactApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
