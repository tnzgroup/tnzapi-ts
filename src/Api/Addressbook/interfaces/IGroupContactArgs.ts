import { ContactModel } from "../Contacts/models/ContactModel";
import { GroupModel } from "../Groups/models/GroupModel";

export interface IGroupContactArgs {
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
    ContactID?: string;
    Contact?: ContactModel;
}

export interface IGroupContactListArgs {
    GroupID?: string;
    GroupCode?: string;
    Group?: GroupModel;
    RecordsPerPage?: number;
    Page?: number;
}