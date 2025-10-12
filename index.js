#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { encryptEnv } from './src/encrypt.js';
import { decryptEnv } from './src/decrypt.js';
import { validateFile } from './src/validator.js';
import { saveKey, getKey, keyExists, listKeys, deleteKey } from './src/keyStore.js';

const MASTER_KEY = 'safekeeper-master-key';

// --- ENCRYPT ---
program
  .command('encrypt')
  .description('Encrypt a .env file')
  .action(async () => {
    console.log(chalk.cyanBright('\n🔐 SafeKeeper — Encrypt Environment File\n'));

    const { file } = await inquirer.prompt({
      type: 'input',
      name: 'file',
      message: '📄 Path to the .env file:'
    });

    validateFile(file);

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '🏷️  Name for this key:'
    });

    if (!name) return console.log(chalk.red('❌ Name is required.'));

    let key = null;
    if (keyExists(name)) {
      console.log(chalk.green(`✅ Found existing key "${name}". Using stored key...`));
      key = getKey(name, MASTER_KEY);
    } else {
      const ans = await inquirer.prompt({
        type: 'input',
        name: 'key',
        message: '🔑 Enter a secret key (leave blank to auto-generate):',
        default: ''
      });
      key = ans.key;
    }

    key = encryptEnv(file, key);

    if (!keyExists(name)) {
      saveKey(name, key, MASTER_KEY);
      console.log(chalk.green(`💾 Key stored securely as "${name}".`));
    }

    console.log(chalk.cyanBright('\n✨ Encryption complete!\n'));
  });

// --- DECRYPT ---
program
  .command('decrypt')
  .description('Decrypt a .env.enc file')
  .action(async () => {
    console.log(chalk.cyanBright('\n🔓 SafeKeeper — Decrypt Environment File\n'));

    const { file } = await inquirer.prompt({
      type: 'input',
      name: 'file',
      message: '📄 Path to the .env.enc file:'
    });

    validateFile(file);

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '🏷️  Name of the key to use:'
    });

    if (!name) return console.log(chalk.red('❌ Name is required.'));

    let key = null;
    if (keyExists(name)) {
      console.log(chalk.green(`✅ Found existing key "${name}". Using stored key...`));
      key = getKey(name, MASTER_KEY);
    } else {
      const ans = await inquirer.prompt({
        type: 'input',
        name: 'key',
        message: '🔑 Enter the secret key:',
        default: ''
      });
      key = ans.key;
    }

    if (!key) {
      console.log(chalk.red('❌ A valid key is required to decrypt this file.'));
      process.exit(1);
    }

    key = decryptEnv(file, key);

    if (!keyExists(name)) {
      saveKey(name, key, MASTER_KEY);
      console.log(chalk.green(`💾 Key stored securely as "${name}".`));
    }

    console.log(chalk.cyanBright('\n✨ Decryption complete!\n'));
  });

// --- KEY COMMANDS ---
program
  .command('key:set')
  .description('Add or update a stored key')
  .action(async () => {
    console.log(chalk.cyanBright('\n⚙️  Manage SafeKeeper Keys\n'));

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '🏷️  Enter key name:'
    });
    if (!name) return console.log(chalk.red('❌ Name is required.'));

    const { value } = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: `🔑 Secret value for "${name}":`
    });
    if (!value) return console.log(chalk.red('❌ Value is required.'));

    if (keyExists(name)) {
      const { confirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `⚠️  Key "${name}" already exists. Overwrite?`,
        default: false
      });
      if (!confirm) return console.log(chalk.yellow('🚫 Operation cancelled.'));
    }

    saveKey(name, value, MASTER_KEY);
    console.log(chalk.green(`💾 Key "${name}" stored successfully.`));
  });

program
  .command('key:get')
  .description('Retrieve and display a stored key')
  .action(async () => {
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '🏷️  Enter key name:'
    });
    if (!name) return console.log(chalk.red('❌ Name is required.'));

    const value = getKey(name, MASTER_KEY);
    if (!value) return console.log(chalk.yellow(`⚠️  No key found for "${name}".`));

    console.log(chalk.greenBright(`\n🔑 Key "${name}": ${chalk.white(value)}\n`));
  });

program
  .command('key:list')
  .description('Show all stored keys (values hidden)')
  .action(() => {
    const keys = listKeys();
    if (!keys.length) return console.log(chalk.yellow('⚠️  No keys found.'));

    console.log(chalk.cyanBright('\n📜 Stored keys:\n'));
    keys.forEach(k => console.log(`  • ${chalk.green(k)}`));
    console.log();
  });

program
  .command('key:delete')
  .description('Delete a stored key')
  .action(async () => {
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: '🏷️  Enter key name to delete:'
    });
    if (!name) return console.log(chalk.red('❌ Name is required.'));

    if (!keyExists(name)) return console.log(chalk.yellow(`⚠️  Key "${name}" not found.`));

    const { confirm } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `🗑️  Delete key "${name}"?`,
      default: false
    });

    if (!confirm) return console.log(chalk.yellow('🚫 Operation cancelled.'));

    deleteKey(name);
    console.log(chalk.green(`✅ Key "${name}" deleted successfully.`));
  });

// --- HELP ---
program.parse(process.argv);
if (!process.argv.slice(2).length) program.outputHelp();
