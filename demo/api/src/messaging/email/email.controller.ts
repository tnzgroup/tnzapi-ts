import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IEmailArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { withTempAttachments } from '../temp-attachments';
import { RescheduleDto, ResubmitDto } from '../action-dtos';
import { SendEmailDto } from './send-email.dto';

@Controller('api/email')
export class EmailController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendEmailDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        await withTempAttachments(body.Attachments, async (attachmentPaths) => {
            const result = await client.Messaging.Email.SendMessage(
                stripUndefined({
                    ...toSdkCommonFields(body),
                    EmailAddress: body.EmailAddress,
                    GroupID: body.GroupID,
                    ContactID: body.ContactID,
                    EmailSubject: body.Subject,
                    MessageHTML: body.MessageHtml,
                    SMTPFrom: body.SmtpFrom,
                    From: body.From,
                    FromEmail: body.FromEmail,
                    CCEmail: body.CcEmail,
                    ReplyTo: body.ReplyTo,
                    Attachments: attachmentPaths,
                }) as IEmailArgs,
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
            Channel: 'email',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'email' });
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
            Channel: 'email',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/resubmit')
    async resubmit(
        @Param('messageId') messageId: string,
        @Body() body: ResubmitDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Resubmit.SendRequest({
            MessageID: messageId,
            Channel: 'email',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }
}
