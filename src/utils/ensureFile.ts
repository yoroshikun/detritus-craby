import {mkdir, stat, writeFile} from 'fs/promises';
import {dirname} from 'path';

/**
 * Ensure a file exists and sets default
 *
 * @param path Path of the file to ensure
 * @param content The default content of the file
 * @returns void
 */
const ensureFile = async (path: string, content: string) => {
  try {
    const file = await stat(path);

    if (file.isFile()) {
      return;
    }

    throw new Error('path is not a file');
  } catch (err) {
    await mkdir(dirname(path), {recursive: true});
    await writeFile(path, Buffer.from(content, 'utf8'));

    return;
  }
};

export default ensureFile;
