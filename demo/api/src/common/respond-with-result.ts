import type { Response } from 'express';

// Accepts `object` (not `Record<string, unknown>`) so callers can pass a concrete SDK response
// DTO instance (MessagingApiSuccessResponseDTO, ErrorResponseDTO, ActionApiResponseDTO, etc.)
// directly — those classes have no index signature, so a Record<string, unknown> parameter type
// would force an `as unknown as Record<string, unknown>` cast at every one of this function's ~30
// call sites across the messaging/addressbook/optout controllers. One cast here instead.
export function respondWithResult(res: Response, result: object): void {
    const data = result as Record<string, unknown>;
    if (data.Result === 'Success') {
        res.status(200).json(data);
        return;
    }
    res.status(400).json({ Result: data.Result, ErrorMessage: data.ErrorMessage });
}
