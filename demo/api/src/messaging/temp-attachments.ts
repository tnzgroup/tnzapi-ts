import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { MessageAttachmentDto, assertAttachmentDecodedSize } from '../common/message-attachment.dto';

export async function withTempAttachments<T>(
    attachments: MessageAttachmentDto[] | undefined,
    fn: (paths: string[]) => Promise<T>,
): Promise<T> {
    if (!attachments || attachments.length === 0) {
        return fn([]);
    }

    // allSettled, not all: with Promise.all, one attachment failing validation/write rejects
    // immediately while a sibling attachment's write is still in flight — that write completes
    // moments later with no code left waiting for it, so its temp file is never in any array the
    // cleanup step can see and it leaks permanently. Waiting for every attempt to settle first
    // means writtenPaths always reflects every file that actually landed on disk, regardless of
    // which attachment failed or how the timing fell.
    const results = await Promise.allSettled(
        attachments.map(async (attachment) => {
            assertAttachmentDecodedSize(attachment.FileContent);
            // path.basename() strips any directory components from the caller-supplied
            // FileName before it ever reaches path.join() — without this, a crafted FileName
            // like "a/../../../../etc/cron.d/evil" could normalize outside os.tmpdir()
            // entirely, letting an attacker write attacker-controlled content (the decoded
            // attachment body) to an arbitrary filesystem location.
            const safeName = path.basename(attachment.FileName);
            const filePath = path.join(os.tmpdir(), `${randomBytes(8).toString('hex')}-${safeName}`);
            await fs.writeFile(filePath, Buffer.from(attachment.FileContent, 'base64'));
            return filePath;
        }),
    );

    const writtenPaths = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map((result) => result.value);

    try {
        const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
        if (failure) {
            throw failure.reason;
        }
        return await fn(writtenPaths);
    } finally {
        await Promise.all(writtenPaths.map((filePath) => fs.rm(filePath, { force: true })));
    }
}
