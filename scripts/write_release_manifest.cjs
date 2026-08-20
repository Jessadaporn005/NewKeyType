const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const releaseDirectory = path.join(root, 'release');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (!fs.existsSync(releaseDirectory)) {
  console.error('RELEASE MANIFEST: release directory is missing');
  process.exit(1);
}

const artifactPrefix = `CyberDeck-${pkg.version}-`;
const artifactNames = fs.readdirSync(releaseDirectory)
  .filter(name => name.startsWith(artifactPrefix) && /\.(exe|blockmap)$/i.test(name) && !name.includes('__uninstaller'))
  .sort();

if (artifactNames.length === 0) {
  console.error('RELEASE MANIFEST: no CyberDeck artifacts found');
  process.exit(1);
}

const files = artifactNames.map(name => {
  const absolutePath = path.join(releaseDirectory, name);
  const bytes = fs.readFileSync(absolutePath);
  return {
    name,
    size: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex')
  };
});

const manifest = {
  schemaVersion: 1,
  product: pkg.build.productName,
  version: pkg.version,
  platform: 'win32-x64',
  channel: 'manual-unsigned',
  codeSigned: false,
  autoUpdateEnabled: false,
  generatedAt: new Date().toISOString(),
  files
};

fs.writeFileSync(path.join(releaseDirectory, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`RELEASE MANIFEST: PASS (${files.length} artifact${files.length === 1 ? '' : 's'} hashed)`);
