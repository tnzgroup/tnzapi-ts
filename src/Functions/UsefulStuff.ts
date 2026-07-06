import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function replaceAll(str: string, find: string, replace: string): string {
    return str.split(find).join(replace);
}

export const isEmpty = (obj: any): boolean => {
    if (typeof obj === 'undefined' || obj === null || obj === '' || obj.length <= 0) {
        return true;
    }
    return false;
}

export const isEmail = (str: string): boolean => {
    if (!str) {
        return false;
    }
    const r = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return r.test(str);
}

export const isNumber = (num: any): boolean => {
    return typeof num === "number" && !isNaN(num);
}

export const isDateTime = (date: string): boolean => {
    if (!date) {
        return false;
    }
    // Require at minimum YYYY-MM-DD prefix — prevents bare numbers like "2024" or "3"
    if (!/^\d{4}-\d{2}-\d{2}/.test(date)) {
        return false;
    }
    const testDate = new Date(date);
    return testDate.toString() !== "Invalid Date";
}

export const isPhoneNumber = (num: string): boolean => {
    const phoneNumber = formatPhoneNumber(num);
    return !isEmpty(phoneNumber);
}

export const isMobileNumber = (num: string): boolean => {
    const mobileNumber = formatMobileNumber(num);
    return !isEmpty(mobileNumber);
}

/**
 * Formats a phone number (landline or mobile) to E.164 numeric-only format.
 * Attempts to parse as NZ first, then AU, then international.
 * Returns an empty string if the number cannot be parsed as a valid number.
 */
export const formatPhoneNumber = (requested_number: string): string => {
    if (!requested_number) {
        return "";
    }
    // Try NZ first, then AU, then treat as international (with leading +)
    const candidateRegions = ['NZ', 'AU'];
    for (const region of candidateRegions) {
        try {
            const parsed = phoneUtil.parse(requested_number, region);
            if (phoneUtil.isValidNumber(parsed)) {
                // Return E.164 without the leading '+'
                return phoneUtil.format(parsed, PhoneNumberFormat.E164).replace(/^\+/, '');
            }
        } catch {
            // try next region
        }
    }
    // Attempt as an already-international number (e.g. +44...)
    try {
        const parsed = phoneUtil.parse(requested_number);
        if (phoneUtil.isValidNumber(parsed)) {
            return phoneUtil.format(parsed, PhoneNumberFormat.E164).replace(/^\+/, '');
        }
    } catch {
        // fall through
    }
    return "";
}

/**
 * Formats a mobile number to E.164 numeric-only format.
 * Attempts to parse as NZ first, then AU, then international.
 * Returns an empty string if the number cannot be parsed as a valid mobile number.
 */
export const formatMobileNumber = (requested_number: string): string => {
    if (isEmpty(requested_number)) {
        return "";
    }
    const candidateRegions = ['NZ', 'AU'];
    for (const region of candidateRegions) {
        try {
            const parsed = phoneUtil.parse(requested_number, region);
            if (phoneUtil.isValidNumber(parsed)) {
                const numberType = phoneUtil.getNumberType(parsed);
                // PhoneNumberType.MOBILE = 1, FIXED_LINE_OR_MOBILE = 2
                if (numberType === 1 || numberType === 2) {
                    return phoneUtil.format(parsed, PhoneNumberFormat.E164).replace(/^\+/, '');
                }
            }
        } catch {
            // try next region
        }
    }
    // Attempt as an already-international number
    try {
        const parsed = phoneUtil.parse(requested_number);
        if (phoneUtil.isValidNumber(parsed)) {
            const numberType = phoneUtil.getNumberType(parsed);
            if (numberType === 1 || numberType === 2) {
                return phoneUtil.format(parsed, PhoneNumberFormat.E164).replace(/^\+/, '');
            }
        }
    } catch {
        // fall through
    }
    return "";
}

export const httpBuildQuery = (data: any): string => {
    return Object.keys(data).map((key) => {
        if (Array.isArray(data[key])) {
            return `${encodeURIComponent(key)}=${encodeURIComponent(data[key].map((item) => item).join(','))}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
    }).join('&');
}

// Encodes a single dynamic URL path segment. Callers pass a value already
// confirmed non-empty by validate() — the non-null assertion lives here once
// instead of being repeated at every call site.
export const encodePathSegment = (value?: string): string => {
    return encodeURIComponent(value!);
}

// Encodes whichever of a GroupID/GroupCode pair is present, as a URL path segment.
// Callers pass values already confirmed not both empty by validate().
export const encodeGroupSegment = (groupId?: string, groupCode?: string): string => {
    return encodeURIComponent((groupId ?? groupCode)!);
}
