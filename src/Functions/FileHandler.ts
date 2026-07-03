import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

const read = util.promisify(fs.readFile);

const FileHandler = {
    fileExists: (file: string): boolean => {
        try {
            return fs.existsSync(file);
        } catch (err) {
            console.error(err);
            return false;
        }
    },
    getFileData: async (file: string): Promise<string> => {
        return (await read(file)).toString("base64");
    },
    getBaseName: (file: string): string => {
        return path.basename(file);
    }
};

export default FileHandler;
