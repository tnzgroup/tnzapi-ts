import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TnzClientService } from '../common/tnz-client.service';
import { respondWithResult } from '../common/respond-with-result';
import { stripUndefined } from '../common/strip-undefined';
import { OptOutCreateDto } from './optout-create.dto';
import { OptOutListQueryDto } from './optout-list-query.dto';

@Controller('api/optout')
export class OptoutController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Get()
    async list(@Query() query: OptOutListQueryDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.OptOut.List(
            stripUndefined({
                RecordsPerPage: query.recordsPerPage,
                Page: query.page,
                DestType: query.destType,
                TimePeriod: query.timePeriod,
                ContactID: query.contactID,
            }),
        );
        respondWithResult(res, result);
    }

    @Post()
    async create(@Body() body: OptOutCreateDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        // Destination/DestType stay direct properties (not inside stripUndefined) so they keep
        // their required `string` type — IOptOutCreateArgs requires both, and stripUndefined's
        // Partial<T> return type would otherwise make them optional. Same pattern as SMS's
        // reply() (Task 7) and Workflow's send() (Task 14).
        const result = await client.OptOut.Create({
            Destination: body.Destination,
            DestType: body.DestType,
            ...stripUndefined({
                Department: body.Department,
                SubAccount: body.SubAccount,
                ContactID: body.ContactID,
                StopMessage: body.StopMessage,
                Notes: body.Notes,
            }),
        });
        respondWithResult(res, result);
    }

    @Get(':id')
    async detail(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.OptOut.Detail({ OptOutID: id });
        respondWithResult(res, result);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.OptOut.Delete({ OptOutID: id });
        respondWithResult(res, result);
    }
}
