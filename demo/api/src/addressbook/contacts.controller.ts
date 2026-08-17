import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TnzClientService } from '../common/tnz-client.service';
import { respondWithResult } from '../common/respond-with-result';
import { stripUndefined } from '../common/strip-undefined';
import { PaginationQueryDto } from '../common/pagination.dto';
import { ContactFieldsDto } from './contact-fields.dto';

@Controller('api/addressbook/contacts')
export class ContactsController {
    constructor(private readonly tnzClient: TnzClientService) {}

    @Get()
    async list(@Query() query: PaginationQueryDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.Contact.List(
            stripUndefined({ RecordsPerPage: query.recordsPerPage, Page: query.page }),
        );
        respondWithResult(res, result);
    }

    @Post()
    async create(@Body() body: ContactFieldsDto, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.Contact.Create(stripUndefined({ ...body }));
        respondWithResult(res, result);
    }

    @Get(':id')
    async detail(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.Contact.Detail({ ContactID: id });
        respondWithResult(res, result);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: ContactFieldsDto,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.Contact.Update({ ContactID: id, ...stripUndefined({ ...body }) });
        respondWithResult(res, result);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
        const client = this.tnzClient.getClient(req);
        const result = await client.Addressbook.Contact.Delete({ ContactID: id });
        respondWithResult(res, result);
    }
}
