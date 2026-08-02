import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await Promise.all([
  copyFile('node_modules/mermaid/LICENSE', 'dist/licenses-mermaid.txt'),
  copyFile('node_modules/jspdf/LICENSE', 'dist/licenses-jspdf.txt')
]);
