import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(repoRoot, 'src', 'icons', 'iconfont.css');
const dest = path.join(repoRoot, 'dist', 'icons.css');
fs.copyFileSync(src, dest);
