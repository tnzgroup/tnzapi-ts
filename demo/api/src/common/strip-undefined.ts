export function stripUndefined<T extends object>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const key of Object.keys(obj) as Array<keyof T>) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}
