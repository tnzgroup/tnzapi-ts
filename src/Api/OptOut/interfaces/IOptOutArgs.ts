export interface IOptOutCreateArgs {
    Destination: string;
    DestType: string;
    Department?: string;
    SubAccount?: string;
    ContactID?: string;
    StopMessage?: string;
    Notes?: string;
}

export interface IOptOutDetailArgs {
    OptOutID: string;
}

export interface IOptOutDeleteArgs {
    OptOutID: string;
}

export interface IOptOutListArgs {
    RecordsPerPage?: number;
    Page?: number;
    DestType?: string;
    TimePeriod?: number;
    ContactID?: string;
}
