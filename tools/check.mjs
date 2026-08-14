import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let failed = false;
for (const file of ['index.html', 'najia/index.html']) {
  const html = readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (blocks.length === 0) {
    console.error(`${file}: 找不到 inline <script>，請確認檔案結構`);
    failed = true;
    continue;
  }
  const tmp = join(tmpdir(), `check-${file.replace(/[\\/]/g, '-')}.js`);
  writeFileSync(tmp, blocks.join('\n;\n'));
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'inherit' });
    console.log(`${file}: syntax OK (${blocks.length} 段)`);
  } catch { failed = true; }
}
process.exit(failed ? 1 : 0);
