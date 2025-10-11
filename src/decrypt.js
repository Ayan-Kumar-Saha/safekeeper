import fs from 'fs';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';
import crypto from 'crypto';

export function decryptEnv(file, key) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Extract metadata lines
  const metadata = lines.filter(l => l.startsWith('#'));
  const encrypted = lines.filter(l => !l.startsWith('#')).join('\n').trim();

  // Extract key-hash from metadata
  const keyHashLine = metadata.find(l => l.startsWith('# key-hash:'));
  if (keyHashLine) {
    const storedHash = keyHashLine.split(':')[1].trim();
    const computedHash = crypto.createHash('sha256').update(key).digest('hex');

    if (storedHash !== computedHash) {
      console.error(chalk.red(`❌ Key hash mismatch. Invalid key for this file.`));
      process.exit(1);
    }
  }

  let decrypted;
  try {
    decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error();
  } catch {
    console.error(chalk.red(`❌ Decryption failed. Invalid key or corrupted file.`));
    process.exit(1);
  }

  const outFile = file.replace(/\.enc$/, '');
  fs.writeFileSync(outFile, decrypted);

  console.log(chalk.green(`✅ Decrypted: ${file} → ${outFile}`));
}
