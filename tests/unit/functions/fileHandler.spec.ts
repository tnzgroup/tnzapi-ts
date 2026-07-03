import * as fs from 'fs';
import * as path from 'path';

// Mock fs before FileHandler is imported so that `const read = util.promisify(fs.readFile)`
// inside FileHandler.ts captures the jest mock functions.
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    readFile: jest.fn(),
}));

import FileHandler from '../../../src/Functions/FileHandler';

const mockedExistsSync = fs.existsSync as unknown as jest.Mock;
const mockedReadFile = fs.readFile as unknown as jest.Mock;

describe('FileHandler', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('fileExists', () => {

        it('returns true when the file exists', () => {
            mockedExistsSync.mockReturnValue(true);
            expect(FileHandler.fileExists('/some/file.txt')).toBe(true);
            expect(mockedExistsSync).toHaveBeenCalledWith('/some/file.txt');
        });

        it('returns false when the file does not exist', () => {
            mockedExistsSync.mockReturnValue(false);
            expect(FileHandler.fileExists('/nonexistent.txt')).toBe(false);
            expect(mockedExistsSync).toHaveBeenCalledWith('/nonexistent.txt');
        });

        it('returns false (not throws) when existsSync throws an error', () => {
            mockedExistsSync.mockImplementation(() => {
                throw new Error('permission denied');
            });
            expect(() => FileHandler.fileExists('/protected.txt')).not.toThrow();
            expect(FileHandler.fileExists('/protected.txt')).toBe(false);
        });

    });

    // -------------------------------------------------------------------------
    describe('getFileData', () => {

        it('resolves with a base64-encoded string for a readable file', async () => {
            const content = Buffer.from('hello world');
            mockedReadFile.mockImplementation(
                (_filePath: string, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
                    callback(null, content);
                }
            );
            const result = await FileHandler.getFileData('/some/file.txt');
            expect(result).toBe(content.toString('base64'));
        });

        it('produces correct base64 output for binary-like content', async () => {
            const content = Buffer.from([0x00, 0xff, 0x10, 0xab]);
            mockedReadFile.mockImplementation(
                (_filePath: string, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
                    callback(null, content);
                }
            );
            const result = await FileHandler.getFileData('/binary.bin');
            expect(result).toBe(content.toString('base64'));
        });

        it('rejects when the file cannot be read', async () => {
            const error = new Error("ENOENT: no such file or directory, open '/missing.txt'") as NodeJS.ErrnoException;
            error.code = 'ENOENT';
            mockedReadFile.mockImplementation(
                (_filePath: string, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
                    callback(error, null as any);
                }
            );
            await expect(FileHandler.getFileData('/missing.txt')).rejects.toThrow('ENOENT');
        });

    });

    // -------------------------------------------------------------------------
    describe('getBaseName', () => {

        it('returns the filename from a POSIX-style absolute path', () => {
            expect(FileHandler.getBaseName('/path/to/file.txt')).toBe('file.txt');
        });

        it('returns the filename from a deeply nested path', () => {
            expect(FileHandler.getBaseName('/a/b/c/document.pdf')).toBe('document.pdf');
        });

        it('returns the name unchanged when there is no directory prefix', () => {
            expect(FileHandler.getBaseName('readme.txt')).toBe('readme.txt');
        });

        it('matches path.basename for a platform-constructed path', () => {
            const full = path.join('some', 'nested', 'dir', 'attachment.zip');
            expect(FileHandler.getBaseName(full)).toBe('attachment.zip');
        });

    });

});