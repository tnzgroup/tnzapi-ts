import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ISMSArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { withTempAttachments } from '../temp-attachments';
import { resolveFallbackMode } from '../fallback-mode';
import { RescheduleDto } from '../action-dtos';
import { SendSmsDto } from './send-sms.dto';
import { ReceivedQueryDto } from './received-query.dto';

const SMS_FALLBACK_ALLOWED: Record<string, string> = { Voice: 'Voice', RCS: 'RCS', WhatsApp: 'WAPP' };

@Controller('api/sms')
export class SmsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendSmsDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const fallback = resolveFallbackMode(body.FallbackMode, SMS_FALLBACK_ALLOWED);
        if (!fallback.ok) {
            res.status(400).json({ Result: 'Failed', ErrorMessage: [fallback.error] });
            return;
        }

        const client = this.tnzClient.getClient(req);
        await withTempAttachments(body.Attachments, async (attachmentPaths) => {
            const result = await client.Messaging.SMS.SendMessage(
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
                }) as ISMSArgs,
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
            Channel: 'sms',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'sms' });
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
            Channel: 'sms',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }

    @Get('reply/:messageId')
    async reply(
        @Param('messageId') messageId: string,
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Reports.SMSReply.Poll({
            MessageID: messageId,
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Get('received')
    async received(@Query() query: ReceivedQueryDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const hasFrom = query.dateFrom !== undefined;
        const hasTo = query.dateTo !== undefined;
        if (hasFrom !== hasTo) {
            res.status(400).json({ Result: 'Failed', ErrorMessage: ['dateFrom and dateTo must be provided together.'] });
            return;
        }
        const hasDateRange = hasFrom && hasTo;
        const client = this.tnzClient.getClient(req);
        const result = await client.Reports.SMSReceived.Poll(
            stripUndefined({
                TimePeriod: hasDateRange ? undefined : query.timePeriod,
                DateFrom: hasDateRange ? query.dateFrom : undefined,
                DateTo: hasDateRange ? query.dateTo : undefined,
                RecordsPerPage: query.recordsPerPage,
                Page: query.page,
            }),
        );
        respondWithResult(res, result);
    }
}
