import { UsefulStuff } from "../../../Functions";
import { MessagingApiSuccessResponseDTO } from "../dtos/MessagingApiSuccessResponseDTO";
import { ErrorResponseDTO } from "../../../Common/dtos/ErrorResponseDTO";
import { isSuccessResult } from "../../../Common/isSuccessResult";

export const MapApiResponse = (responseData: any): MessagingApiSuccessResponseDTO | ErrorResponseDTO => {

    if (!UsefulStuff.isEmpty(responseData)) {

        if (responseData.HttpStatusCode === 200 || isSuccessResult(responseData.Result)) {
            const { HttpStatusCode: _status, ...rest } = responseData;
            return new MessagingApiSuccessResponseDTO({ Result: "Success", ...rest });
        }
    }

    return new ErrorResponseDTO({ Result: "Error", ...responseData });
};
