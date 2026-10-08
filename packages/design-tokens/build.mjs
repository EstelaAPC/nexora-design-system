import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const source = dirname(fileURLToPath(import.meta.url));
const output = join(source, 'dist');

await mkdir(output, { recursive: true });
for (const file of ['index.css', 'primitives.css', 'semantic.css', 'components.css']) {
  await copyFile(join(source, 'src', file), join(output, file));
}
