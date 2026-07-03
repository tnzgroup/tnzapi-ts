import { UsefulStuff } from '../../../../Functions';
import { GroupApiResponseDTO } from '../dtos/GroupApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { GroupModel } from '../models/GroupModel';

export const MapApiResponse = (responseData: any): GroupApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Group)) {
                responseData.Group = new GroupModel(responseData.Group);
            }
            return new GroupApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
