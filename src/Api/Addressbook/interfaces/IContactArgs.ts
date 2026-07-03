export interface IContactFields {
    Title?: string;
    Company?: string;
    FirstName?: string;
    LastName?: string;
    Position?: string;
    Attention?: string;
    RecipDepartment?: string;
    StreetAddress?: string;
    Suburb?: string;
    City?: string;
    State?: string;
    Country?: string;
    Postcode?: string;
    MainPhone?: string;
    DirectPhone?: string;
    MobilePhone?: string;
    AltPhone1?: string;
    AltPhone2?: string;
    FaxNumber?: string;
    EmailAddress?: string;
    WebAddress?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;
    Timezone?: string;
    ViewBy?: string;
    EditBy?: string;
}

export interface IContactCreateArgs extends IContactFields {}

export interface IContactUpdateArgs extends IContactFields {
    ContactID: string;
}

export interface IContactDetailArgs {
    ContactID: string;
}

export interface IContactDeleteArgs {
    ContactID: string;
}

export interface IContactListArgs {
    RecordsPerPage?: number;
    Page?: number;
}