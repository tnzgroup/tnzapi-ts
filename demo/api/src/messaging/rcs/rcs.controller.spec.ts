import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { RcsController } from './rcs.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendRcsDto } from './send-rcs.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('RcsController', () => {
    let controller: RcsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RcsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(RcsController);
    });

    it('send: maps a single FallbackMode value through the allowed table', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { RCS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send({ ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['WhatsApp'] } as SendRcsDto, req, res);

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ FallbackMode: ['WAPP'] }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('send: maps multiple FallbackMode values through, joined by the SDK', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { RCS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['SMS', 'Voice'] } as SendRcsDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ FallbackMode: ['SMS', 'Voice'] }));
    });

    it('send: still rejects a value unsupported on this channel', async () => {
        const res = mockRes();
        await controller.send({ ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['Carrier'] } as SendRcsDto, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            Result: 'Failed',
            ErrorMessage: ["Unsupported FallbackMode 'Carrier' for this channel."],
        });
        expect(tnzClient.getClient).not.toHaveBeenCalled();
    });

    it('send: translates SmsEmailReply to SMSEmailReply and forwards Message', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { RCS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send({ ToNumber: '+64211234567', Message: 'hi', SmsEmailReply: 'reply@example.com' } as SendRcsDto, req, res);

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ ToNumber: '+64211234567', Message: 'hi', SMSEmailReply: 'reply@example.com' }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('received: returns a documented 501 without calling the SDK', async () => {
        const res = mockRes();
        await controller.received(res);

        expect(tnzClient.getClient).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(501);
    });

    it('status: forwards RecordsPerPage/Page with Channel=rcs', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'rcs', RecordsPerPage: 10, Page: 2 });
    });
});
