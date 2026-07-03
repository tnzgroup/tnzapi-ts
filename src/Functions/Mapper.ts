import { isEmpty } from "./UsefulStuff";

export const Map = <T extends object>(obj: T, data: Partial<T> | object): void => {
    if (isEmpty(data) || typeof obj !== 'object' || obj === null || typeof data !== 'object' || data === null) {
        return;
    }

    for (const name in data) {
        if (Object.prototype.hasOwnProperty.call(data, name)) {
            const sourceProp = (data as Record<string, unknown>)[name];
            const destProp = (obj as Record<string, unknown>)[name];

            if (typeof sourceProp === 'object' && sourceProp !== null && !Array.isArray(sourceProp) &&
                typeof destProp === 'object' && destProp !== null && !Array.isArray(destProp)) {
                Map(destProp as object, sourceProp as Record<string, unknown>);
            } else {
                (obj as Record<string, unknown>)[name] = sourceProp;
            }
        }
    }
};