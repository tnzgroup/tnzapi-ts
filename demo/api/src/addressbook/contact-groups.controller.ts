import { Body, Controller, Delete, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TnzClientService } from '../common/tnz-client.service';
import { respondWithResult } from '../common/respond-with-result';
import { stripUndefined } from '../common/strip-undefined';
import { ContactGroupBodyDto, ContactGroupListQueryDto } from './contact-group-query.dto';

@Controller('api/addressbook/contact-groups')
export class ContactGroupsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Post()
    async create(@Body() body: ContactGroupBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.ContactGroup.Create({ ContactID: body.ContactID, GroupID: body.GroupID });
        respondWithResult(res, result);
    }

    @Get()
    async list(@Query() query: ContactGroupListQueryDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.ContactGroup.List({
            ContactID: query.contactID,
            ...stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        });
        respondWithResult(res, result);
    }

    // Body, not path segments — the shared frontend calls DELETE with a JSON body, not
    // /:contactId/:groupId, even though the Python reference backend's router expects the
    // latter. See Task 17's header note.
    @Delete()
    async remove(@Body() body: ContactGroupBodyDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.ContactGroup.Delete({ ContactID: body.ContactID, GroupID: body.GroupID });
        respondWithResult(res, result);
    }
}
