import fs from 'fs';
import crypto from 'crypto';
import chalk from 'chalk';

const ALGO = 'aes-256-gcm';

export function decryptEnv(file, key) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  const metadata = lines.filter(l => l.startsWith('#'));
  const data = lines.filter(l => !l.startsWith('#')).join('\n').trim();

  const keyHashLine = metadata.find(l => l.startsWith('# key-hash:'));
  if (keyHashLine) {
    const storedHash = keyHashLine.split(':')[1].trim();
    const computedHash = crypto.createHash('sha256').update(key).digest('hex');
    
    if (storedHash !== computedHash) {
      console.error(chalk.red(`❌ Key hash mismatch. Invalid key for this file.`));
      process.exit(1);
    }
  }

  try {
    const buffer = Buffer.from(data, 'base64');

    // Layout: [12-byte IV][Encrypted Data][16-byte Auth Tag]
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(buffer.length - 16);
    const encrypted = buffer.subarray(12, buffer.length - 16);

    const derivedKey = crypto.createHash('sha256').update(key).digest();
    const decipher = crypto.createDecipheriv(ALGO, derivedKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');

    const outFile = file.replace(/\.enc$/, '');
    fs.writeFileSync(outFile, decrypted);

    console.log(chalk.green(`✅ Decrypted: ${file} → ${outFile}`));
  } catch (err) {
    console.error(chalk.red(`❌ Decryption failed. Invalid key or corrupted file.`));
    process.exit(1);
  }

  return key;
}
