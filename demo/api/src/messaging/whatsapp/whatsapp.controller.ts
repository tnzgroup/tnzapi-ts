import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IWhatsAppArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { PaginationQueryDto } from '../../common/pagination.dto';
import { toSdkCommonFields } from '../common-field-mapping';
import { withTempAttachments } from '../temp-attachments';
import { resolveFallbackMode } from '../fallback-mode';
import { RescheduleDto } from '../action-dtos';
import { SendWhatsappDto } from './send-whatsapp.dto';

const WHATSAPP_FALLBACK_ALLOWED: Record<string, string> = { RCS: 'RCS', SMS: 'SMS', Voice: 'Voice' };

function buildCustomFields(body: SendWhatsappDto): Record<string, string> {
    return stripUndefined({
        Custom1: body.Custom1,
        Custom2: body.Custom2,
        Custom3: body.Custom3,
        Custom4: body.Custom4,
        Custom5: body.Custom5,
        Custom6: body.Custom6,
        Custom7: body.Custom7,
        Custom8: body.Custom8,
        Custom9: body.Custom9,
    }) as Record<string, string>;
}

@Controller('api/whatsapp')
export class WhatsappController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendWhatsappDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const fallback = resolveFallbackMode(body.FallbackMode, WHATSAPP_FALLBACK_ALLOWED);
        if (!fallback.ok) {
            res.status(400).json({ Result: 'Failed', ErrorMessage: [fallback.error] });
            return;
        }

        const customFields = buildCustomFields(body);
        const hasCustomFields = Object.keys(customFields).length > 0;

        const client = this.tnzClient.getClient(req);
        await withTempAttachments(body.Attachments, async (attachmentPaths) => {
            const result = await client.Messaging.WhatsApp.SendMessage(
                stripUndefined({
                    ...toSdkCommonFields(body),
                    ...(hasCustomFields
                        ? {
                              Destinations: [
                                  stripUndefined({
                                      ToNumber: body.ToNumber,
                                      GroupID: body.GroupID,
                                      ContactID: body.ContactID,
                                      ...customFields,
                                  }),
                              ],
                          }
                        : { ToNumber: body.ToNumber, GroupID: body.GroupID, ContactID: body.ContactID }),
                    Message: body.Message,
                    FromNumber: body.FromNumber,
                    FallbackMode: fallback.value,
                    Attachments: attachmentPaths,
                }) as IWhatsAppArgs,
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
            Channel: 'whatsapp',
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Patch(':messageId/abort')
    async abort(@Param('messageId') messageId: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Actions.Abort.SendRequest({ MessageID: messageId, Channel: 'whatsapp' });
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
            Channel: 'whatsapp',
            SendTime: body.SendTime,
        });
        respondWithResult(res, result);
    }

    // tnzapi-ts has no WhatsApp Received report (Reports only exposes SMSReceived, hardcoded to
    // /sms/received) — documented 501 rather than a silent 404, matching the ssl-verification
    // precedent in SettingsController.
    @Get('received')
    received(@Res() res: Response): void {
        res.status(501).json({
            Result: 'Failed',
            ErrorMessage: [
                "tnzapi-ts has no WhatsApp Received report — Reports.SMSReceived only covers SMS. This endpoint exists so the shared frontend's Received page doesn't 404; there is no way to implement this for real against this SDK.",
            ],
        });
    }
}
