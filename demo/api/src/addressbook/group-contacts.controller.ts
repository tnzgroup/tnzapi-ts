import { Body, Controller, Delete, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TnzClientService } from '../common/tnz-client.service';
import { respondWithResult } from '../common/respond-with-result';
import { stripUndefined } from '../common/strip-undefined';
import { GroupContactBodyDto, GroupContactListQueryDto } from './group-contact-query.dto';

@Controller('api/addressbook/group-contacts')
export class GroupContactsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post()
    async create(@Body() body: GroupContactBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.GroupContact.Create({ GroupID: body.GroupID, ContactID: body.ContactID });
        respondWithResult(res, result);
    }

    @Get()
    async list(@Query() query: GroupContactListQueryDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.GroupContact.List({
            GroupID: query.groupID,
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    @Delete()
    async remove(@Body() body: GroupContactBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.GroupContact.Delete({ GroupID: body.GroupID, ContactID: body.ContactID });
        respondWithResult(res, result);
    }
}
