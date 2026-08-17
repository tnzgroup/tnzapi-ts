import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { EmailController } from './email.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendEmailDto } from './send-email.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('EmailController', () => {
    let controller: EmailController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmailController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(EmailController);
    });

    it('send: translates Subject/MessageHtml/SmtpFrom/CcEmail to the SDK field names', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Email: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            {
                EmailAddress: 'a@example.com',
                Subject: 'Hi',
                MessageHtml: '<p>Hi</p>',
                SmtpFrom: 'smtp@example.com',
                CcEmail: 'cc@example.com',
            } as SendEmailDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                EmailAddress: 'a@example.com',
                EmailSubject: 'Hi',
                MessageHTML: '<p>Hi</p>',
                SMTPFrom: 'smtp@example.com',
                CCEmail: 'cc@example.com',
            }),
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('resubmit: forwards SendTime with Channel=email', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Resubmit: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.resubmit('msg-1', { SendTime: '2026-08-01 09:00' }, req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'email', SendTime: '2026-08-01 09:00' });
    });

    it('status: calls Reports.Status.Poll with Channel=email and forwards RecordsPerPage/Page when provided', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'email', RecordsPerPage: 10, Page: 2 });
    });
});
