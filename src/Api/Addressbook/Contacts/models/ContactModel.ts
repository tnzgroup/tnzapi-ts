export class ContactModel {
    ContactID?: string;
    ViewBy?: string;
    EditBy?: string;
    Owner?: string;
    CreatedTimeLocal?: string;
    CreatedTimeUTC?: string;
    UpdatedTimeLocal?: string;
    UpdatedTimeUTC?: string;
    Timezone?: string;
    Attention?: string;
    Title?: string;
    Company?: string;
    RecipDepartment?: string;
    FirstName?: string;
    LastName?: string;
    Position?: string;
    StreetAddress?: string;
    Suburb?: string;
    City?: string;
    State?: string;
    Country?: string;
    Postcode?: string;
    MainPhone?: string;
    AltPhone1?: string;
    AltPhone2?: string;
    DirectPhone?: string;
    MobilePhone?: string;
    FaxNumber?: string;
    EmailAddress?: string;
    WebAddress?: string;
    Custom1?: string;
    Custom2?: string;
    Custom3?: string;
    Custom4?: string;

    constructor(data?: any) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
