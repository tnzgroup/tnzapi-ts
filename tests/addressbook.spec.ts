
import { TNZAPI } from '../src';

const authToken = process.env.TNZ_AUTH_TOKEN;

describe('Addressbook API', () => {

  let client: TNZAPI;

  beforeAll(() => {
    if (!authToken) {
      console.warn('TNZ_AUTH_TOKEN not set. Tests will likely fail.');
    }
    client = new TNZAPI({
      AuthToken: authToken,
    });
  });

  // Contacts
  describe('Contacts', () => {
    it('should list contacts', (done) => {
      client.Addressbook.Contact.List({
        RecordsPerPage: 10,
        Page: 1
      }).then(data => {
        console.log("Response:", JSON.stringify(data, null, "  "));
        expect(data).toMatchObject({ Result: expect.any(String) });
        done();
      }).catch(err => {
        done(err);
      });
    });

    /*
    it('should get contact details', (done) => {
      // First create a contact to get details of
      client.Addressbook.Contact.Create({
        FirstName: "Test",
        LastName: "Contact"
      }).then(created => {
        client.Addressbook.Contact.Detail({
          ContactID: created.ContactID
        }).then(data => {
          console.log("Response:", JSON.stringify(data, null, "  "));
          expect(data.Result).toBe('Success');
          // Clean up created contact
          client.Addressbook.Contact.Delete({ ContactID: created.ContactID }).then(() => done());
        }).catch(err => {
          done(err);
        });
      });
    });

    it('should create a contact', (done) => {
      client.Addressbook.Contact.Create({
        Title: "Mr",
        Company: "TNZ Group",
        FirstName: "First",
        LastName: "Last",
        MobilePhone: "+6421000001",
        ViewBy: "Account",
        EditBy: "Account"
      }).then(data => {
        console.log("Response:", JSON.stringify(data, null, "  "));
        expect(data.Result).toBe('Success');
        // Clean up created contact
        client.Addressbook.Contact.Delete({ ContactID: data.ContactID }).then(() => done());
      }).catch(err => {
        done(err);
      });
    });

    it('should update a contact', (done) => {
      // First create a contact to update
      client.Addressbook.Contact.Create({
        FirstName: "Test",
        LastName: "Contact"
      }).then(created => {
        client.Addressbook.Contact.Update({
          ContactID: created.ContactID,
          Attention: "Test Attention",
          Title: "Mr",
          Company: "TNZ Group",
          FirstName: "First",
          LastName: "Last",
          MobilePhone: "+64212223333",
          ViewPublic: "Account",
          EditPublid: "Account"
        }).then(data => {
          console.log("Response:", JSON.stringify(data, null, "  "));
          expect(data.Result).toBe('Success');
          // Clean up created contact
          client.Addressbook.Contact.Delete({ ContactID: created.ContactID }).then(() => done());
        }).catch(err => {
          done(err);
        });
      });
    });

    it('should delete a contact', (done) => {
      // First create a contact to delete
      client.Addressbook.Contact.Create({
        FirstName: "Test",
        LastName: "Contact"
      }).then(created => {
        client.Addressbook.Contact.Delete({
          ContactID: created.ContactID
        }).then(data => {
          console.log("Response:", JSON.stringify(data, null, "  "));
          expect(data.Result).toBe('Success');
          done();
        }).catch(err => {
          done(err);
        });
      });
    });
    */
  });

  // Contact Groups
  describe('Contact Groups', () => {
    // ... tests for Contact Groups ...
  });

  // Groups
  describe('Groups', () => {
    // ... tests for Groups ...
  });

  // Group Contacts
  describe('Group Contacts', () => {
    // ... tests for Group Contacts ...
  });

});
