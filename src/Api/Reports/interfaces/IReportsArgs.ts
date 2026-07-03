export interface IStatusArgs {
    MessageID: string;
    Channel?: string;
    RecordsPerPage?: number;
    Page?: number;
}

export interface ISMSReplyArgs {
    MessageID: string;
    RecordsPerPage?: number;
    Page?: number;
}

export interface ISMSReceivedArgs {
    TimePeriod?: number;
    DateFrom?: string;
    DateTo?: string;
    RecordsPerPage?: number;
    Page?: number;
}