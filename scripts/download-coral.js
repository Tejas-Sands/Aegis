import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import https from 'https';

const CORAL_VERSION = 'v0.4.1';
const BIN_DIR = path.join(process.cwd(), 'bin');
const BIN_PATH = path.join(BIN_DIR, 'coral');
const TAR_URL = `https://github.com/withcoral/coral/releases/download/${CORAL_VERSION}/coral-x86_64-unknown-linux-gnu.tar.gz`;
const TAR_PATH = path.join(process.cwd(), 'coral.tar.gz');

// Check if we already have the binary
if (fs.existsSync(BIN_PATH)) {
  console.log('Coral CLI binary already exists locally. Skipping download.');
  process.exit(0);
}

// Make sure target dir exists
if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

console.log(`Downloading Coral CLI version ${CORAL_VERSION} for Linux x86_64...`);

function downloadFile(url, dest, callback) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    // Handle redirects
    if (response.statusCode === 302 || response.statusCode === 301) {
      downloadFile(response.headers.location, dest, callback);
      return;
    }
    if (response.statusCode !== 200) {
      callback(new Error(`Failed to download: Status code ${response.statusCode}`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close(callback);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    callback(err);
  });
}

downloadFile(TAR_URL, TAR_PATH, (err) => {
  if (err) {
    console.error('Error downloading Coral CLI:', err.message);
    process.exit(1);
  }

  console.log('Download complete. Extracting tarball...');

  const tar = spawn('tar', ['-xzf', TAR_PATH, '-C', BIN_DIR]);

  tar.on('close', (code) => {
    // Clean up tarball
    try {
      fs.unlinkSync(TAR_PATH);
    } catch {}

    if (code !== 0) {
      console.error(`Tar extraction failed with exit code ${code}`);
      process.exit(1);
    }

    // Set execution permissions
    try {
      fs.chmodSync(BIN_PATH, '755');
      console.log(`Coral CLI binary successfully installed at: ${BIN_PATH}`);
    } catch (chmodErr) {
      console.error('Failed to set executable permissions on binary:', chmodErr.message);
      process.exit(1);
    }
  });
});
