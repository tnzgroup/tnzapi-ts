import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IRCSArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { withTempAttachments } from '../temp-attachments';
import { resolveFallbackMode } from '../fallback-mode';
import { RescheduleDto } from '../action-dtos';
import { SendRcsDto } from './send-rcs.dto';

const RCS_FALLBACK_ALLOWED: Record<string, string> = { SMS: 'SMS', Voice: 'Voice', WhatsApp: 'WAPP' };

@Controller('api/rcs')
export class RcsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendRcsDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const fallback = resolveFallbackMode(body.FallbackMode, RCS_FALLBACK_ALLOWED);
        if (!fallback.ok) {
            res.status(400).json({ Result: 'Failed', ErrorMessage: [fallback.error] });
            return;
        }

        const client = this.tnzClient.getClient(req);
        await withTempAttachments(body.Attachments, async (attachmentPaths) => {
            const result = await client.Messaging.RCS.SendMessage(
                stripUndefined({
                    ...toSdkCommonFields(body),
                    ToNumber: body.ToNumber,
                    GroupID: body.GroupID,
                    ContactID: body.ContactID,
                    Message: body.Message,
                    FromNumber: body.FromNumber,
                    SMSEmailReply: body.SmsEmailReply,
                    CharacterConversion: body.CharacterConversion,
                    FallbackMode: fallback.value,
                    Attachments: attachmentPaths,
                }) as IRCSArgs,
            );
            respondWithResult(res, result);
        });
    }

    @Get('status/:messageId')
    async status(
        @Param('messageId') messageId: string,
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Reports.Status.Poll({
            MessageID: messageId,
            Channel: 'rcs',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'rcs' });
        respondWithResult(res, result);
    }

    @Patch(':messageId/reschedule')
    async reschedule(
        @Param('messageId') messageId: string,
        @Body() body: RescheduleDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Reschedule.SendRequest({
            MessageID: messageId,
            Channel: 'rcs',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }

    // Same documented gap as WhatsApp's Received endpoint — no RCSReceived on this SDK's Reports.
    @Get('received')
    received(@Res() res: Response): void {
        res.status(501).json({
            Result: 'Failed',
            ErrorMessage: [
                "tnzapi-ts has no RCS Received report — Reports.SMSReceived only covers SMS. This endpoint exists so the shared frontend's Received page doesn't 404; there is no way to implement this for real against this SDK.",
            ],
        });
    }
}
