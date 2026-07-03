import { Contact } from "./Contacts";
import { ContactGroup } from "./ContactGroups";
import { Group } from "./Groups";
import { GroupContact } from "./GroupContacts";
import { ITNZAuthArgs } from "../../interfaces";

export class Addressbook {
    public Contact: Contact;
    public ContactGroup: ContactGroup;
    public Group: Group;
    public GroupContact: GroupContact;

    constructor(auth: ITNZAuthArgs) {
        const args = { ...auth, URL: `${auth.URL}/addressbook` };

        this.Contact = new Contact(args);
        this.ContactGroup = new ContactGroup(args);
        this.Group = new Group(args);
        this.GroupContact = new GroupContact(args);
    }
}
