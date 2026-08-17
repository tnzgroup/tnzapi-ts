import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { WorkflowController } from './workflow.controller';
import { TnzClientService } from '../../common/tnz-client.service';
import { SendWorkflowDto } from './send-workflow.dto';

function mockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response;
}

describe('WorkflowController', () => {
    let controller: WorkflowController;
    let tnzClient: { getClient: jest.Mock };
    const req = {} as Request;

    beforeEach(async () => {
        tnzClient = { getClient: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkflowController],
            providers: [{ provide: TnzClientService, useValue: tnzClient }],
        }).compile();
        controller = module.get(WorkflowController);
    });

    it('send: combines ToNumber/MainPhone/EmailAddress onto one explicit destination', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Workflow: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            {
                WorkflowTemplateId: 'wf-1',
                ToNumber: '+64211234567',
                EmailAddress: 'a@example.com',
            } as SendWorkflowDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                WorkflowTemplateID: 'wf-1',
                Destinations: [{ ToNumber: '+64211234567', EmailAddress: 'a@example.com' }],
            }),
        );
        expect(sendMessage.mock.calls[0][0]).not.toHaveProperty('ToNumber');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('send: forwards ContactIds/GroupIds through the ContactID/GroupID shorthand alongside an explicit destination', async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Workflow: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { WorkflowTemplateId: 'wf-1', ToNumber: '+64211234567', ContactIds: '1,2', GroupIds: '3' } as SendWorkflowDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                WorkflowTemplateID: 'wf-1',
                Destinations: [{ ToNumber: '+64211234567' }],
                ContactID: '1,2',
                GroupID: '3',
            }),
        );
    });

    it("send: maps SendMode='Test' to Mode='Test' — supported for real on this SDK, unlike the Python reference", async () => {
        const sendMessage = jest.fn().mockResolvedValue({ Result: 'Success', MessageID: 'msg-1', ErrorMessage: [] });
        tnzClient.getClient.mockReturnValue({ Messaging: { Workflow: { SendMessage: sendMessage } } });

        const res = mockRes();
        await controller.send(
            { WorkflowTemplateId: 'wf-1', ContactIds: '1', SendMode: 'Test' } as SendWorkflowDto,
            req,
            res,
        );

        expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ Mode: 'Test' }));
    });
});
