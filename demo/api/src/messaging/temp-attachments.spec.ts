import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { withTempAttachments } from './temp-attachments';
import { MAX_ATTACHMENT_SIZE_BYTES } from '../common/message-attachment.dto';

describe('withTempAttachments', () => {
    it('calls fn with [] and skips file I/O when there are no attachments', async () => {
        const result = await withTempAttachments(undefined, async (paths) => {
            expect(paths).toEqual([]);
            return 'done';
        });
        expect(result).toBe('done');
    });

    it('writes each attachment to a temp file named after FileName, readable inside fn', async () => {
        const content = Buffer.from('hello world').toString('base64');
        let capturedPath = '';
        await withTempAttachments([{ FileName: 'invoice.pdf', FileContent: content }], async (paths) => {
            expect(paths).toHaveLength(1);
            expect(paths[0].endsWith('invoice.pdf')).toBe(true);
            capturedPath = paths[0];
            expect(fs.readFileSync(paths[0]).toString('base64')).toBe(content);
        });
        expect(fs.existsSync(capturedPath)).toBe(false);
    });

    it('deletes temp files even when fn throws', async () => {
        const content = Buffer.from('x').toString('base64');
        let capturedPath = '';
        await expect(
            withTempAttachments([{ FileName: 'a.txt', FileContent: content }], async (paths) => {
                capturedPath = paths[0];
                throw new Error('boom');
            }),
        ).rejects.toThrow('boom');
        expect(fs.existsSync(capturedPath)).toBe(false);
    });

    it('strips directory components from a path-traversal FileName, staying inside os.tmpdir()', async () => {
        const content = Buffer.from('evil').toString('base64');
        await withTempAttachments(
            [{ FileName: '../../../../../../etc/cron.d/evil', FileContent: content }],
            async (paths) => {
                expect(paths).toHaveLength(1);
                expect(path.dirname(paths[0])).toBe(path.resolve(os.tmpdir()));
                expect(paths[0].endsWith('evil')).toBe(true);
                expect(paths[0]).not.toContain('..');
            },
        );
    });

    it("cleans up a sibling attachment's temp file even when another attachment in the same batch fails validation", async () => {
        const validContent = Buffer.from('ok').toString('base64');
        const oversizedContent = Buffer.alloc(MAX_ATTACHMENT_SIZE_BYTES + 3, 'a').toString('base64');

        await expect(
            withTempAttachments(
                [
                    { FileName: 'valid.txt', FileContent: validContent },
                    { FileName: 'oversized.txt', FileContent: oversizedContent },
                ],
                async () => 'unreachable — fn must not run when one attachment fails validation',
            ),
        ).rejects.toThrow(`Attachment decodes to more than ${MAX_ATTACHMENT_SIZE_BYTES} bytes`);

        const leftoverFiles = fs
            .readdirSync(os.tmpdir())
            .filter((name) => name.endsWith('-valid.txt') || name.endsWith('-oversized.txt'));
        expect(leftoverFiles).toEqual([]);
    });
});
