// encrypt.js
import fs from 'fs';
import crypto from 'crypto';
import chalk from 'chalk';

const ALGO = 'aes-256-gcm';

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

  // Key hash for verification
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  const metadata = [
    `# safekeeper:1.0.0`,
    `# file:${file}`,
    `# created:${new Date().toISOString()}`,
    `# key-hash:${keyHash}`
  ].join('\n');

  const outFile = `${file}.enc`;
  fs.writeFileSync(outFile, `${metadata}\n\n${payload}`);

  console.log(chalk.green(`✅ Encrypted: ${file} → ${outFile}`));
}
