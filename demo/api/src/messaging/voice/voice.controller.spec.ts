import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { VoiceController } from './voice.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendVoiceDto } from './send-voice.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('VoiceController', () => {
    let controller: VoiceController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VoiceController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(VoiceController);
    });

    it('send: forwards base64 MessageToPeople and keypad PlayFile directly, with no VoiceFiles array', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Voice: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            {
                ToNumber: '+64211234567',
                MessageToPeople: 'base64audiocontent==',
                Keypads: [{ Tone: 1, PlayFile: 'base64keypadaudio==' }],
            } as SendVoiceDto,
            req,
            res,
        );

        const sentArgs = sendMessage.mock.calls[0][0];
        expect(sentArgs).toMatchObject({
            ToNumber: '+64211234567',
            MessageToPeople: 'base64audiocontent==',
            Keypads: [{ Tone: 1, PlayFile: 'base64keypadaudio==' }],
        });
        expect(sentArgs).not.toHaveProperty('VoiceFiles');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('pacing: forwards NumberOfOperators with Channel=voice', async () => {
        const sendRequest = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Actions: { Pacing: { SendRequest: sendRequest } } });

        const res = mockRes();
        await controller.pacing('msg-1', { NumberOfOperators: 5 }, req, res);

        expect(sendRequest).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'voice', NumberOfOperators: 5 });
    });

    it('status: forwards RecordsPerPage/Page with Channel=voice', async () => {
        const poll = jest.fn().mockResolvedValue({ Result: 'Success' });
        tnzClient.getClient.mockReturnValue({ Reports: { Status: { Poll: poll } } });

        const res = mockRes();
        await controller.status('msg-1', { recordsPerPage: 10, page: 2 }, req, res);

        expect(poll).toHaveBeenCalledWith({ MessageID: 'msg-1', Channel: 'voice', RecordsPerPage: 10, Page: 2 });
    });
});
