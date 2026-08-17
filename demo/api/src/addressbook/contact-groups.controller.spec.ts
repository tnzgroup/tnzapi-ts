import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { ContactGroupsController } from './contact-groups.controller';
import { TnzClientService } from '../common/tnz-client.service';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('ContactGroupsController', () => {
    let controller: ContactGroupsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactGroupsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(ContactGroupsController);
    });

    it('create: forwards ContactID/GroupID', async () => {
        const create = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { ContactGroup: { Create: create } } });

        const res = mockRes();
        await controller.create({ ContactID: 'c-1', GroupID: 'g-1' }, req, res);

        expect(create).toHaveBeenCalledWith({ ContactID: 'c-1', GroupID: 'g-1' });
    });

    it('list: reads the camelCase contactID query param', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', Groups: [] });
        tnzClient.getClient.mockReturnValue({ Addressbook: { ContactGroup: { List: list } } });

        const res = mockRes();
        await controller.list({ contactID: 'c-1' }, req, res);

        expect(list).toHaveBeenCalledWith({ ContactID: 'c-1' });
    });

    it("remove: uses the request BODY, not path segments — matches the frontend's actual call shape", async () => {
        const del = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { ContactGroup: { Delete: del } } });

        const res = mockRes();
        await controller.remove({ ContactID: 'c-1', GroupID: 'g-1' }, req, res);

        expect(del).toHaveBeenCalledWith({ ContactID: 'c-1', GroupID: 'g-1' });
    });
});
