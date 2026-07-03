import { IMessagingDestination } from "../interfaces";

export type IAddRecipientArg<T = IMessagingDestination> = string | T | Array<string | T>;

export const AddRecipient = <T = IMessagingDestination>(recipient: IAddRecipientArg<T>): T[] => {
    let targets: T[] = [];

    if (typeof recipient === "string") {
        targets.push({ "Recipient": recipient } as unknown as T);
    } else if (Array.isArray(recipient)) {
        for (const item of recipient) {
            targets = targets.concat(AddRecipient<T>(item));
        }
    } else if (typeof recipient === "object" && recipient !== null) {
        targets.push(recipient as T);
    }

    return targets;
};
