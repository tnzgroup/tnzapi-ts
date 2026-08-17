import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MessageAttachmentDto } from './message-attachment.dto';

describe('MessageAttachmentDto', () => {
    it('accepts a valid base64 attachment', async () => {
        const dto = plainToInstance(MessageAttachmentDto, {
            FileName: 'invoice.pdf',
            FileContent: Buffer.from('hello world').toString('base64'),
        });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects non-base64 FileContent', async () => {
        const dto = plainToInstance(MessageAttachmentDto, {
            FileName: 'invoice.pdf',
            FileContent: 'not-base64!!!',
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects an attachment whose decoded size exceeds 10 MiB', async () => {
        // +3 bytes (not +1): base64 groups 3 source bytes into 4 characters, so a payload only
        // 1-2 bytes over the limit can round to the *same* base64 string length as the limit
        // itself — @MaxLength alone can't distinguish them (that's exactly why
        // assertAttachmentDecodedSize exists as the exact backstop, applied separately where
        // attachments are consumed). +3 bytes crosses a full base64 group boundary, which
        // @MaxLength can and must catch on its own.
        const oversized = Buffer.alloc(10 * 1024 * 1024 + 3, 'a').toString('base64');
        const dto = plainToInstance(MessageAttachmentDto, { FileName: 'big.bin', FileContent: oversized });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
