import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IFaxArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { withTempAttachments } from '../temp-attachments';
import { RescheduleDto, ResubmitDto } from '../action-dtos';
import { SendFaxDto } from './send-fax.dto';

@Controller('api/fax')
export class FaxController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendFaxDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        await withTempAttachments(body.Attachments, async (attachmentPaths) => {
            const result = await client.Messaging.Fax.SendMessage(
                stripUndefined({
                    ...toSdkCommonFields(body),
                    ToNumber: body.ToNumber,
                    GroupID: body.GroupID,
                    ContactID: body.ContactID,
                    CSID: body.Csid,
                    CallerID: body.CallerId,
                    Resolution: body.Resolution,
                    WatermarkFolder: body.WatermarkFolder,
                    WatermarkFirstPage: body.WatermarkFirstPage,
                    WatermarkAllPages: body.WatermarkAllPages,
                    RetryAttempts: body.RetryAttempts,
                    RetryPeriod: body.RetryPeriod,
                    Attachments: attachmentPaths,
                }) as IFaxArgs,
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
            Channel: 'fax',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'fax' });
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
            Channel: 'fax',
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
            Channel: 'fax',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }
}
