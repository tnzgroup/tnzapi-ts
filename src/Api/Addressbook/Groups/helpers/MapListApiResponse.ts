import { UsefulStuff } from '../../../../Functions';
import { GroupListApiResponseDTO } from '../dtos/GroupListApiResponseDTO';
import { ErrorResponseDTO } from '../../../../Common/dtos/ErrorResponseDTO';
import { isSuccessResult } from '../../../../Common/isSuccessResult';
import { GroupModel } from '../models/GroupModel';

export const MapListApiResponse = (responseData: any): GroupListApiResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {
        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            if (!UsefulStuff.isEmpty(responseData.Groups)) {
                const groups: GroupModel[] = [];
                for (const group of responseData.Groups) {
                    groups.push(new GroupModel(group));
                }
                responseData.Groups = groups;
            }
            return new GroupListApiResponseDTO(responseData);
        }
    }

    return new ErrorResponseDTO(responseData);
};
