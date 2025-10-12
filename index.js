#!/usr/bin/env node
import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { encryptEnv } from './src/encrypt.js';
import { decryptEnv } from './src/decrypt.js';
import { validateFile } from './src/validator.js';
import { saveKey, getKey, keyExists, listKeys, deleteKey } from './src/keyStore.js';

const MASTER_KEY = 'safekeeper-master-key';

program
  .command('encrypt')
  .description('Encrypt a .env file')
  .action(async () => {

    const { file } = await inquirer.prompt({
      type: 'input',
      name: 'file',
      message: 'Enter the path to the .env file:'
    });

    validateFile(file);

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'Enter a name for this key:'
    });

    if (!name)
      return console.log(chalk.red(`❌ name is required`));

    let key = null;

    if (keyExists(name)) {
      console.log(chalk.green('✅ Key already exists in the store! Using the same...'));
      key = getKey(name, MASTER_KEY);
    } else if (!key) {
      const ans = await inquirer.prompt({
        type: 'input',
        name: 'key',
        message: 'Enter a secret key (leave blank to auto-generate):',
        default: ''
      });
      key = ans.key;
    }

    key = encryptEnv(file, key);

    if (!keyExists(name)) {
      saveKey(name, key, MASTER_KEY);
      console.log(chalk.green(`✅ Key saved in store as "${name}"`));
    }
  });


program
  .command('decrypt')
  .description('Decrypt a .env.enc file')
  .action(async () => {

    const { file } = await inquirer.prompt({
      type: 'input',
      name: 'file',
      message: 'Enter the path to the .env.enc file:'
    });

    validateFile(file);

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'Enter the name of the key to be used:'
    });

    if (!name)
      return console.log(chalk.red(`❌ name is required`));

    let key = null;

    if (keyExists(name)) {
      console.log(chalk.green('✅ Key already exists in store! Using the same...'));
      key = getKey(name, MASTER_KEY);
    } else if (!key) {
      const ans = await inquirer.prompt({
        type: 'input',
        name: 'key',
        message: 'Enter the secret key:',
        default: ''
      });
      key = ans.key;
    }

    if (!key) {
      console.log(chalk.red('❌ Key is required for decryption (one-time only).'));
      process.exit(1);
    }

    key = decryptEnv(file, key);

    if (!keyExists(name)) {
      saveKey(name, key, MASTER_KEY);
      console.log(chalk.green(`✅ Key saved in store as "${name}"`));
    }
  });

program
  .command('key:set')
  .description('Set a new key')
  .action(async () => {

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `Enter the name of the key?`
    })

    if (!name)
      return console.log(chalk.red(`❌ name is required`));

    const { value } = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: `Enter the secret value for key "${name}":`
    });

    if (!value)
      return console.log(chalk.red(`❌ value is required`));

    if (keyExists(name)) {
      const { confirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to overwrite  key "${name}"?`,
        default: false
      });

      if (!confirm)
        return console.log(chalk.yellow('⚠️  Operation cancelled.'));
    }

    saveKey(name, value, MASTER_KEY);
    console.log(chalk.green(`✅ Key "${name}" saved.`));
  });

program
  .command('key:get')
  .description('Get a stored key value')
  .action(async () => {

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `Enter the name of the key?`
    });

    if (!name)
      return console.log(chalk.red(`❌ name is required`));

    const value = getKey(name, MASTER_KEY);

    if (!value)
      return console.log(chalk.yellow(`⚠️  Key "${name}" not found.`));

    console.log(chalk.green(`🔑 ${name}: ${value}`));
  });

program
  .command('key:list')
  .description('List all stored keys (values hidden)')
  .action(() => {
    const keys = listKeys();

    if (!keys.length)
      return console.log(chalk.yellow('⚠️ No keys stored.'));

    console.log(chalk.cyan('📜 Stored keys:'));
    keys.forEach(k => console.log(`  ${chalk.green(k)}`));
  });

program
  .command('key:delete')
  .description('Delete a stored key')
  .action(async () => {

    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `Enter the name of the key: `
    });

    if (!name)
      return console.log(chalk.red(`❌ name is required`));

    if (!keyExists(name))
      return console.log(chalk.yellow(`⚠️ Key "${name}" not found.`));

    const { confirm } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete key "${name}"?`,
      default: false
    });

    if (!confirm)
      return console.log(chalk.yellow('⚠️ Operation cancelled.'));

    deleteKey(name);
    console.log(chalk.green(`🗑️ Key "${name}" deleted.`));
  });


program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
