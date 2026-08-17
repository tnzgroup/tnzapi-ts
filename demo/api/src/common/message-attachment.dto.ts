import { BadRequestException } from '@nestjs/common';
import { IsBase64, IsString, MaxLength } from 'class-validator';

// Reference-implementation-only limits (not real TNZ API limits) — mirrors the Python demo's
// app/attachments.py caps exactly, so both demos reject the same oversized/over-count requests.
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENT_COUNT = 20;

function decodedBase64Length(base64: string): number {
    const padding = (base64.match(/=+$/) ?? [''])[0].length;
    return Math.floor((base64.length * 3) / 4) - padding;
}

export class MessageAttachmentDto {
    @IsString()
    FileName!: string;

    // Tightest bound achievable via string length alone: base64 groups 3 source bytes into 4
    // characters, so this is the base64 length of exactly MAX_ATTACHMENT_SIZE_BYTES bytes — any
    // longer string must decode to more than that. (No slack added: a looser bound would let a
    // handful of over-limit bytes slip through inside the same base64 group.)
    @IsBase64()
    @MaxLength(Math.ceil(MAX_ATTACHMENT_SIZE_BYTES / 3) * 4, {
        message: `FileContent decodes to more than ${MAX_ATTACHMENT_SIZE_BYTES} bytes`,
    })
    FileContent!: string;
}

// class-validator's @MaxLength above bounds the base64 *string* length as a cheap first check;
// this exact byte-count check is the real limit, applied where attachments are consumed
// (each channel's send() method) since class-validator has no natural "decode then measure" rule.
// Throws BadRequestException specifically (not a plain Error) so AllExceptionsFilter's
// HttpException branch surfaces this as 400 — a plain Error would fall through to that filter's
// 500 default, misrepresenting an oversized upload (a client mistake) as a server crash.
export function assertAttachmentDecodedSize(content: string): void {
    if (decodedBase64Length(content) > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new BadRequestException(`Attachment decodes to more than ${MAX_ATTACHMENT_SIZE_BYTES} bytes`);
    }
}
