import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { SmsController } from './sms.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendSmsDto } from './send-sms.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('SmsController', () => {
    let controller: SmsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SmsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(SmsController);
    });

    it('send: maps multiple FallbackMode values through, joined by the SDK', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { SMS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['Voice', 'RCS'] } as SendSmsDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ FallbackMode: ['Voice', 'RCS'] }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("send: maps FallbackMode 'WhatsApp' to the SDK's 'WAPP' value and forwards to SendMessage", async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { SMS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['WhatsApp'] } as SendSmsDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['WAPP'], Attachments: [] }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
    });

    it('status: calls Reports.Status.Poll with Channel=sms and no pagination keys when absent', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', {}, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'sms' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('status: forwards RecordsPerPage/Page when provided', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'sms', RecordsPerPage: 10, Page: 2 });
    });

    it('abort: calls Actions.Abort.SendRequest with Channel=sms', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Abort: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.abort('msg-1', req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'sms' });
    });

    it('reschedule: forwards SendTime with Channel=sms', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Reschedule: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.reschedule('msg-1', { SendTime: '2026-08-01 09:00' }, req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'sms', SendTime: '2026-08-01 09:00' });
    });

    it('reply: omits RecordsPerPage/Page when absent, letting the SDK default apply', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { SMSReply: { Poll: poll } } });

        const res = mockRes();
        await controller.reply('msg-1', {}, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1' });
    });

    it('reply: forwards RecordsPerPage/Page when provided', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { SMSReply: { Poll: poll } } });

        const res = mockRes();
        await controller.reply('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', RecordsPerPage: 10, Page: 2 });
    });

    it('received: prefers DateFrom/DateTo over TimePeriod when both are supplied', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { SMSReceived: { Poll: poll } } });

        const res = mockRes();
        await controller.received({ dateFrom: '2026-08-01 00:00', dateTo: '2026-08-02 00:00', timePeriod: 60 }, req, res);

        expect(poll).toHaveBeenCalledWith({ DateFrom: '2026-08-01 00:00', DateTo: '2026-08-02 00:00' });
    });

    it('received: falls back to TimePeriod when no date range is supplied', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { SMSReceived: { Poll: poll } } });

        const res = mockRes();
        await controller.received({ timePeriod: 60 }, req, res);

        expect(poll).toHaveBeenCalledWith({ TimePeriod: 60 });
    });

    it('received: rejects a one-sided date range (dateFrom without dateTo) instead of silently dropping it', async () => {
        const res = mockRes();
        await controller.received({ dateFrom: '2026-08-01 00:00' }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            Result: 'Failed',
            ErrorMessage: ['dateFrom and dateTo must be provided together.'],
        });
        expect(tnzClient.getClient).not.toHaveBeenCalled();
    });

    it('received: rejects a one-sided date range (dateTo without dateFrom)', async () => {
        const res = mockRes();
        await controller.received({ dateTo: '2026-08-02 00:00' }, req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(tnzClient.getClient).not.toHaveBeenCalled();
    });
});
