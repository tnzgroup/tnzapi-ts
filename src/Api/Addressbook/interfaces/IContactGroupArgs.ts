import { ContactModel } from "../Contacts/models/ContactModel";
import { GroupModel } from "../Groups/models/GroupModel";

export interface IContactGroupArgs {
    ContactID?: string;
    Contact?: ContactModel;
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
}

export interface IContactGroupListArgs {
    ContactID?: string;
    Contact?: ContactModel;
    RecordsPerPage?: number;
    Page?: number;
}