import { isEmpty } from "./UsefulStuff";

// Field names that must never be copied by Map(), regardless of source or destination.
// These are the internal auth/config fields every Api class constructor receives
// ({ URL, AuthToken, httpClient }) — Map() has no way to know which destination fields
// are "real" business data (most model classes declare optional fields with no default,
// so they have no own properties to whitelist against on a fresh instance), so this
// denylist is the shared choke point that stops that bag from ever reaching an outbound
// request body, no matter which future Api class constructor accidentally passes it in.
const NEVER_COPY = new Set(['URL', 'AuthToken', 'httpClient']);

export const Map = <T extends object>(obj: T, data: Partial<T> | object): void => {
    if (isEmpty(data) || typeof obj !== 'object' || obj === null || typeof data !== 'object' || data === null) {
        return;
    }

    for (const name in data) {
        if (Object.prototype.hasOwnProperty.call(data, name) && !NEVER_COPY.has(name)) {
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