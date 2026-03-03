const path = require('path');
const fs = require('fs');
const { compileFromFile } = require('json-schema-to-typescript');

async function main() {
  const baseDir = path.join(__dirname, '..', 'shared', 'schema');
  const files = [
    'user.export.json',
    'userInsert.export.json',
    'userUpdate.export.json',
    'passwordResetRequest.export.json',
    'passwordResetConfirm.export.json'
  ];
  const outPath = path.join(__dirname, '..', 'shared', 'types.d.ts');
  let contents = '/* AUTO-GENERATED FROM JSON SCHEMA. DO NOT EDIT BY HAND. */\n\n';
  for (const f of files) {
    const ts = await compileFromFile(path.join(baseDir, f), { bannerComment: '' });
    contents += ts + '\n';
  }
  fs.writeFileSync(outPath, contents);
  console.log('Generated types at', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
