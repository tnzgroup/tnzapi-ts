import { Result } from './Result';

// Strict comparison is intentional — see the casing contract documented on Result.
export const isSuccessResult = (result?: string | null): boolean => {
    return result === Result.Success;
};