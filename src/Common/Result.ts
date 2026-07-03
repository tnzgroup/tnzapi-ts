// Values are Pascal-case exactly as the API sends them (see spec/tnz-rest-api-v3.00.yaml,
// QueryResult) — the API never sends alternate casings like "SUCCESS" or "success",
// so comparisons against these values (e.g. isSuccessResult) are intentionally strict.
export enum Result {
    Success = "Success",
    Failed = "Failed",
    Error = "Error",
    Unauthorized = "Unauthorized",
}
