import fs from 'fs';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';
import crypto from 'crypto';

export function encryptEnv(file, key) {
  if (!key) {
    key = crypto.randomBytes(16).toString('hex');
    console.log(chalk.yellow(`🔑 No key provided. Generated new key: ${key}`));
    console.log(chalk.gray(`Save this key and share securely with your team.`));
  }

  const env = fs.readFileSync(file, 'utf-8');
  const encrypted = CryptoJS.AES.encrypt(env, key).toString();

  const outFile = `${file}.enc`;
  fs.writeFileSync(outFile, encrypted);

  console.log(chalk.green(`✅ Encrypted: ${file} → ${outFile}`));
}
