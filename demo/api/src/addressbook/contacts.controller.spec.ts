import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { ContactsController } from './contacts.controller';
import { TnzClientService } from '../common/tnz-client.service';
import { ContactFieldsDto } from './contact-fields.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('ContactsController', () => {
    let controller: ContactsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(ContactsController);
    });

    it('list: omits RecordsPerPage/Page when absent', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', Contacts: [] });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Contact: { List: list } } });

        const res = mockRes();
        await controller.list({}, req, res);

        expect(list).toHaveBeenCalledWith({});
    });

    it('create: forwards contact fields without a ContactID', async () => {
        const create = jest.fn().mockResolvedValue({ Result: 'Success', ContactID: 'c-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Contact: { Create: create } } });

        const res = mockRes();
        await controller.create({ FirstName: 'Alice', EmailAddress: 'a@example.com' } as ContactFieldsDto, req, res);

        expect(create).toHaveBeenCalledWith({ FirstName: 'Alice', EmailAddress: 'a@example.com' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('detail: calls Detail with the path id as ContactID', async () => {
        const detail = jest.fn().mockResolvedValue({ Result: 'Success', ContactID: 'c-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Contact: { Detail: detail } } });

        const res = mockRes();
        await controller.detail('c-1', req, res);

        expect(detail).toHaveBeenCalledWith({ ContactID: 'c-1' });
    });

    it('update: includes the path ContactID alongside the body fields', async () => {
        const update = jest.fn().mockResolvedValue({ Result: 'Success', ContactID: 'c-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Contact: { Update: update } } });

        const res = mockRes();
        await controller.update('c-1', { FirstName: 'Alice' } as ContactFieldsDto, req, res);

        expect(update).toHaveBeenCalledWith({ ContactID: 'c-1', FirstName: 'Alice' });
    });

    it('remove: calls Delete with the path ContactID', async () => {
        const del = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Contact: { Delete: del } } });

        const res = mockRes();
        await controller.remove('c-1', req, res);

        expect(del).toHaveBeenCalledWith({ ContactID: 'c-1' });
    });
});
