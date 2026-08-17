import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { OptoutController } from './optout.controller';
import { TnzClientService } from '../common/tnz-client.service';
import { OptOutCreateDto } from './optout-create.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('OptoutController', () => {
    let controller: OptoutController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OptoutController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(OptoutController);
    });

    it('create: forwards Destination/DestType and optional fields', async () => {
        const create = jest.fn().mockResolvedValue({ Result: 'Success', ID: 'o-1' });
        tnzClient.getClient.mockReturnValue({ OptOut: { Create: create } });

        const res = mockRes();
        await controller.create(
            { Destination: '+64211234567', DestType: 'Mobile', Notes: 'requested by phone' } as OptOutCreateDto,
            req,
            res,
        );

        expect(create).toHaveBeenCalledWith({
            Destination: '+64211234567',
            DestType: 'Mobile',
            Notes: 'requested by phone',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('detail: calls Detail with the path id as OptOutID', async () => {
        const detail = jest.fn().mockResolvedValue({ Result: 'Success', ID: 'o-1' });
        tnzClient.getClient.mockReturnValue({ OptOut: { Detail: detail } });

        const res = mockRes();
        await controller.detail('o-1', req, res);

        expect(detail).toHaveBeenCalledWith({ OptOutID: 'o-1' });
    });

    it('remove: calls Delete with the path id as OptOutID', async () => {
        const del = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ OptOut: { Delete: del } });

        const res = mockRes();
        await controller.remove('o-1', req, res);

        expect(del).toHaveBeenCalledWith({ OptOutID: 'o-1' });
    });

    it('list: omits RecordsPerPage/Page/DestType/TimePeriod/ContactID when absent', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', OptOuts: [] });
        tnzClient.getClient.mockReturnValue({ OptOut: { List: list } });

        const res = mockRes();
        await controller.list({}, req, res);

        expect(list).toHaveBeenCalledWith({});
    });

    it('list: forwards DestType/TimePeriod/ContactID filters when provided', async () => {
        const list = jest.fn().mockResolvedValue({ Result: 'Success', OptOuts: [] });
        tnzClient.getClient.mockReturnValue({ OptOut: { List: list } });

        const res = mockRes();
        await controller.list({ destType: 'Mobile', timePeriod: 30, contactID: 'c-1' }, req, res);

        expect(list).toHaveBeenCalledWith({ DestType: 'Mobile', TimePeriod: 30, ContactID: 'c-1' });
    });
});
