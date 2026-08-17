import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { TtsController } from './tts.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendTtsDto } from './send-tts.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('TtsController', () => {
    let controller: TtsController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TtsController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(TtsController);
    });

    it('send: maps ToNumber to MainPhone and CallerId to CallerID, omits RetryAttempts/RetryPeriod/NumberOfOperators when absent', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { TTS: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { ToNumber: '+64211234567', MessageToPeople: 'Hello', CallerId: '+64211234568' } as SendTtsDto,
            req,
            res,
        );

        const sentArgs = sendMessage.mock.calls[0][0];
        expect(sentArgs).toMatchObject({ ToNumber: '+64211234567', MessageToPeople: 'Hello', CallerID: '+64211234568' });
        expect(sentArgs).not.toHaveProperty('RetryAttempts');
        expect(sentArgs).not.toHaveProperty('RetryPeriod');
        expect(sentArgs).not.toHaveProperty('NumberOfOperators');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('pacing: forwards NumberOfOperators with Channel=tts', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Pacing: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.pacing('msg-1', { NumberOfOperators: 5 }, req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'tts', NumberOfOperators: 5 });
    });

    it('status: forwards RecordsPerPage/Page with Channel=tts', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'tts', RecordsPerPage: 10, Page: 2 });
    });
});
