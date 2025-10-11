import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const ALGO = 'aes-256-gcm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const VERSION = pkg.version || '1.0.0';

export function encryptEnv(file, key) {
  if (!key) {
    key = crypto.randomBytes(16).toString('hex');
    console.log(chalk.yellow(`🔑 No key provided. Generated new key: ${key}`));
    console.log(chalk.gray(`Save this key and share securely with your team.`));
  }

  const env = fs.readFileSync(file, 'utf-8');

  const iv = crypto.randomBytes(12); // GCM nonce
  const derivedKey = crypto.createHash('sha256').update(key).digest(); // 32-byte key
  const cipher = crypto.createCipheriv(ALGO, derivedKey, iv);

  const encrypted = Buffer.concat([cipher.update(env, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, encrypted, authTag]).toString('base64');

  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  const metadata = [
    `# safekeeper:${VERSION}`,
    `# file:${file}`,
    `# created:${new Date().toISOString()}`,
    `# key-hash:${keyHash}`
  ].join('\n');

  const outFile = `${file}.enc`;
  fs.writeFileSync(outFile, `${metadata}\n\n${payload}`);

  console.log(chalk.green(`✅ Encrypted: ${file} → ${outFile}`));
}
