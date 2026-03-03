const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const typesPath = path.join(__dirname, '..', 'shared', 'types.d.ts');
const before = fs.existsSync(typesPath) ? fs.readFileSync(typesPath, 'utf8') : '';
const r = spawnSync(process.execPath, [path.join(__dirname, 'generate-types.cjs')], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);
const after = fs.existsSync(typesPath) ? fs.readFileSync(typesPath, 'utf8') : '';
if (before !== after) {
  console.error('Regenerated shared/types.d.ts has changes. Commit the updated file.');
  process.exit(1);
}
console.log('Types are up-to-date.');

