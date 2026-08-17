import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { GroupsController } from './groups.controller';
import { TnzClientService } from '../common/tnz-client.service';
import { GroupFieldsDto } from './group-fields.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('GroupsController', () => {
    let controller: GroupsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(GroupsController);
    });

    it('list: omits RecordsPerPage/Page when absent', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', Groups: [] });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { List: list } } });

        const res = mockRes();
        await controller.list({}, req, res);

        expect(list).toHaveBeenCalledWith({});
    });

    it('list: forwards RecordsPerPage/Page when provided', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', Groups: [] });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { List: list } } });

        const res = mockRes();
        await controller.list({ recordsPerPage: 10, page: 2 }, req, res);

        expect(list).toHaveBeenCalledWith({ RecordsPerPage: 10, Page: 2 });
    });

    it('create: forwards GroupName without a GroupID', async () => {
        const create = jest.fn().mockResolvedValue({ Result: 'Success', GroupID: 'g-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { Create: create } } });

        const res = mockRes();
        await controller.create({ GroupName: 'VIP' } as GroupFieldsDto, req, res);

        expect(create).toHaveBeenCalledWith({ GroupName: 'VIP' });
    });

    it('detail: calls Detail with the path id as GroupID', async () => {
        const detail = jest.fn().mockResolvedValue({ Result: 'Success', GroupID: 'g-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { Detail: detail } } });

        const res = mockRes();
        await controller.detail('g-1', req, res);

        expect(detail).toHaveBeenCalledWith({ GroupID: 'g-1' });
    });

    it('update: includes the path GroupID alongside the body fields', async () => {
        const update = jest.fn().mockResolvedValue({ Result: 'Success', GroupID: 'g-1' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { Update: update } } });

        const res = mockRes();
        await controller.update('g-1', { GroupName: 'VIP' } as GroupFieldsDto, req, res);

        expect(update).toHaveBeenCalledWith({ GroupID: 'g-1', GroupName: 'VIP' });
    });

    it('remove: calls Delete with the path id as GroupID', async () => {
        const del = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Addressbook: { Group: { Delete: del } } });

        const res = mockRes();
        await controller.remove('g-1', req, res);

        expect(del).toHaveBeenCalledWith({ GroupID: 'g-1' });
    });
});
