import { UsefulStuff } from '../../../Functions';
import { ActionApiResponseDTO } from '../dtos/ActionApiResponseDTO';
import { ErrorResponseDTO } from '../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../Common/isSuccessResult';

export const MapApiResponse = (responseData: any): ActionApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.ActionResult)) {
            return new ActionApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
