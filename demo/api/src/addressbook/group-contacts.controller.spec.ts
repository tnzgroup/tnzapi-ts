import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { GroupContactsController } from './group-contacts.controller';
import { TnzClientService } from '../common/tnz-client.service';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('GroupContactsController', () => {
    let controller: GroupContactsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupContactsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(GroupContactsController);
    });

    it('create: forwards GroupID/ContactID', async () => {
        const create = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { GroupContact: { Create: create } } });

        const res = mockRes();
        await controller.create({ GroupID: 'g-1', ContactID: 'c-1' }, req, res);

        expect(create).toHaveBeenCalledWith({ GroupID: 'g-1', ContactID: 'c-1' });
    });

    it('list: reads the camelCase groupID query param', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', Contacts: [] });
        tnzClient.getClient.mockReturnValue({ Addressbook: { GroupContact: { List: list } } });

        const res = mockRes();
        await controller.list({ groupID: 'g-1' }, req, res);

        expect(list).toHaveBeenCalledWith({ GroupID: 'g-1' });
    });

    it("remove: uses the request BODY, not path segments — matches the frontend's actual call shape", async () => {
        const del = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { GroupContact: { Delete: del } } });

        const res = mockRes();
        await controller.remove({ GroupID: 'g-1', ContactID: 'c-1' }, req, res);

        expect(del).toHaveBeenCalledWith({ GroupID: 'g-1', ContactID: 'c-1' });
    });
});
