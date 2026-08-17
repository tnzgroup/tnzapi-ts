import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { WhatsappController } from './whatsapp.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendWhatsappDto } from './send-whatsapp.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('WhatsappController', () => {
    let controller: WhatsappController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WhatsappController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(WhatsappController);
    });

    it('send: uses the plain ToNumber shorthand when no Custom fields are present', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { WhatsApp: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send({ ToNumber: '+64211234567,+64211234568', Message: 'hi' } as SendWhatsappDto, req, res);

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ ToNumber: '+64211234567,+64211234568' }));
        expect(sendMessage.mock.calls[0][0]).not.toHaveProperty('Destinations');
    });

    it('send: builds a single explicit Destination when Custom fields are present', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { WhatsApp: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', TemplateId: 'tmpl-1', Custom1: 'Alice', Custom2: 'Order #123' } as SendWhatsappDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ Destinations: [{ ToNumber: '+64211234567', Custom1: 'Alice', Custom2: 'Order #123' }] }),
        );
        expect(sendMessage.mock.calls[0][0]).not.toHaveProperty('ToNumber');
    });

    it('send: keeps GroupID/ContactID on the explicit Destination alongside Custom fields', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { WhatsApp: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { GroupID: 'g-1', TemplateId: 'tmpl-1', Custom1: 'Alice' } as SendWhatsappDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ Destinations: [{ GroupID: 'g-1', Custom1: 'Alice' }] }),
        );
    });

    it('send: maps multiple FallbackMode values through, joined by the SDK', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { WhatsApp: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', Message: 'hi', FallbackMode: ['RCS', 'SMS'] } as SendWhatsappDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ FallbackMode: ['RCS', 'SMS'] }));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('received: returns a documented 501 without calling the SDK', async () => {
        const res = mockRes();
        await controller.received(res);

        expect(tnzClient.getClient).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ Result: 'Failed', ErrorMessage: expect.arrayContaining([expect.stringContaining('no WhatsApp Received report')]) }),
        );
    });

    it('status: forwards RecordsPerPage/Page with Channel=whatsapp', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'whatsapp', RecordsPerPage: 10, Page: 2 });
    });
});
