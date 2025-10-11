#!/usr/bin/env node
import { encryptEnv } from './src/encrypt.js';
import { decryptEnv } from './src/decrypt.js';
import { validateFile, validateKey } from './src/validator.js';

const [,, cmd, ...rest] = process.argv;

const fileFlagIndex = rest.indexOf('--file');
const file = fileFlagIndex !== -1 ? rest[fileFlagIndex + 1] : null;

const keyFlagIndex = rest.indexOf('--key');
const key = keyFlagIndex !== -1 ? rest[keyFlagIndex + 1] : null;

validateFile(file)

if (cmd === 'encrypt') {
  encryptEnv(file, key);
}

else if (cmd === 'decrypt') {
  validateKey(key)
  decryptEnv(file, key);
}
else {
  console.log(`Usage:
  safekeeper encrypt [file] [--key <secret>]
  safekeeper decrypt [file.enc] [--key <secret>]

Examples:
  safekeeper encrypt .env.local
  safekeeper decrypt .env.local.enc --key mysecretkey`);
}

