import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { IWorkflowArgs } from 'tnzapi-ts';
import { TnzClientService } from '../../common/tnz-client.service';
import { respondWithResult } from '../../common/respond-with-result';
import { stripUndefined } from '../../common/strip-undefined';
import { toSdkCommonFields } from '../common-field-mapping';
import { SendWorkflowDto } from './send-workflow.dto';

@Controller('api/workflow')
export class WorkflowController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post('send')
    async send(@Body() body: SendWorkflowDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const primaryDestination = stripUndefined({
            ToNumber: body.ToNumber,
            MainPhone: body.MainPhone,
            EmailAddress: body.EmailAddress,
        });
        const hasPrimaryDestination = Object.keys(primaryDestination).length > 0;

        const client = this.tnzClient.getClient(req);
        const result = await client.Messaging.Workflow.SendMessage(
            stripUndefined({
                ...toSdkCommonFields(body),
                WorkflowTemplateID: body.WorkflowTemplateId,
                Destinations: hasPrimaryDestination ? [primaryDestination] : undefined,
                ContactID: body.ContactIds,
                GroupID: body.GroupIds,
            }) as IWorkflowArgs,
        );
        respondWithResult(res, result);
    }
}
