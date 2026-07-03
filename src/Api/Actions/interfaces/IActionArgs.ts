export interface IAbortArgs {
    MessageID: string;
    Channel: string;
}

export interface IResubmitArgs {
    MessageID: string;
    Channel: string;
    SendTime?: string;
}

export interface IRescheduleArgs {
    MessageID: string;
    Channel: string;
    SendTime: string;
}

export interface IPacingArgs {
    MessageID: string;
    Channel: string;
    NumberOfOperators: number;
}