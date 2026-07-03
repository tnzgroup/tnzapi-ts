export interface IGroupFields {
    GroupName?: string;
    ViewEditBy?: string;
    SubAccount?: string;
    Department?: string;
}

export interface IGroupCreateArgs extends IGroupFields {}

export interface IGroupUpdateArgs extends IGroupFields {
    GroupID?: string;
    GroupCode?: string;
}

export interface IGroupDetailArgs {
    GroupID?: string;
    GroupCode?: string;
}

export interface IGroupDeleteArgs {
    GroupID?: string;
    GroupCode?: string;
}

export interface IGroupListArgs {
    RecordsPerPage?: number;
    Page?: number;
}