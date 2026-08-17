import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { FaxController } from './fax.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendFaxDto } from './send-fax.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('FaxController', () => {
    let controller: FaxController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FaxController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(FaxController);
    });

    it('send: translates Csid/CallerId to CSID/CallerID and forwards Resolution', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Fax: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', Csid: 'MyFax', CallerId: '+64211234568', Resolution: 'High' } as SendFaxDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ ToNumber: '+64211234567', CSID: 'MyFax', CallerID: '+64211234568', Resolution: 'High' }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('resubmit: forwards SendTime with Channel=fax', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Resubmit: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.resubmit('msg-1', { SendTime: '2026-08-01 09:00' }, req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'fax', SendTime: '2026-08-01 09:00' });
    });

    it('status: forwards RecordsPerPage/Page with Channel=fax', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'fax', RecordsPerPage: 10, Page: 2 });
    });
});
