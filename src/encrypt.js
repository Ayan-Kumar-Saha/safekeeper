import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';
import crypto from 'crypto';

// Read package.json version dynamically
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'));
const VERSION = pkg.version || '1.0.0';

export function encryptEnv(file, key) {
  if (!key) {
    key = crypto.randomBytes(16).toString('hex');
    console.log(chalk.yellow(`🔑 No key provided. Generated new key: ${key}`));
    console.log(chalk.gray(`Save this key and share securely with your team.`));
  }

  const env = fs.readFileSync(file, 'utf-8');
  const encrypted = CryptoJS.AES.encrypt(env, key).toString();

  // Generate SHA256 hash of key
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  const metadata = [
    `# envman:${VERSION}`,
    `# file:${file}`,
    `# created:${new Date().toISOString()}`,
    `# key-hash:${keyHash}`
  ].join('\n');

  const outFile = `${file}.enc`;
  fs.writeFileSync(outFile, `${metadata}\n\n${encrypted}`);

  console.log(chalk.green(`✅ Encrypted: ${file} → ${outFile}`));
  console.log(chalk.gray(`🔑 Key hash: ${keyHash} (for verification)`));
}
