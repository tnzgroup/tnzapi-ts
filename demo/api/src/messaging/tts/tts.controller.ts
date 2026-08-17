import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ITTSArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { RescheduleDto, ResubmitDto, PacingDto } from '../action-dtos';
import { SendTtsDto } from './send-tts.dto';

@Controller('api/tts')
export class TtsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendTtsDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Messaging.TTS.SendMessage(
            stripUndefined({
                ...toSdkCommonFields(body),
                ToNumber: body.ToNumber,
                GroupID: body.GroupID,
                ContactID: body.ContactID,
                MessageToPeople: body.MessageToPeople,
                MessageToAnswerPhones: body.MessageToAnswerPhones,
                AnswerPhoneMode: body.AnswerPhoneMode,
                Keypads: body.Keypads,
                KeypadOptionRequired: body.KeypadOptionRequired,
                CallRouteMessageOnWrongKey: body.CallRouteMessageOnWrongKey,
                CallRouteMessageToPeople: body.CallRouteMessageToPeople,
                CallRouteMessageToOperators: body.CallRouteMessageToOperators,
                EndCallMessage: body.EndCallMessage,
                NumberOfOperators: body.NumberOfOperators,
                RetryAttempts: body.RetryAttempts,
                RetryPeriod: body.RetryPeriod,
                CallerID: body.CallerId,
                Voice: body.Voice,
                Options: body.Options,
            }) as ITTSArgs,
        );
        respondWithResult(res, result);
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
            Channel: 'tts',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'tts' });
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
            Channel: 'tts',
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
            Channel: 'tts',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/pacing')
    async pacing(
        @Param('messageId') messageId: string,
        @Body() body: PacingDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Pacing.SendRequest({
            MessageID: messageId,
            Channel: 'tts',
            NumberOfOperators: body.NumberOfOperators,
        });
        respondWithResult(res, result);
    }
}
