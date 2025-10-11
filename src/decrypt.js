import fs from 'fs';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';

export function decryptEnv(file, key) {
  const encrypted = fs.readFileSync(file, 'utf-8');
  let decrypted;

  try {
    decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      console.error(chalk.red(`❌ Decryption failed. Invalid key.`));
      process.exit(1);
    }
  } catch {
    console.error(chalk.red(`❌ Decryption failed. Invalid key.`));
    process.exit(1);
  }

  const outFile = file.replace(/\.enc$/, '');
  fs.writeFileSync(outFile, decrypted);

  console.log(chalk.green(`✅ Decrypted: ${file} → ${outFile}`));
}
