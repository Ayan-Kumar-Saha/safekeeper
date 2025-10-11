import fs from 'fs';
import chalk from 'chalk';

export function validateFile(file) {
    if (!file) {
        console.error(chalk.red(`❌ No file provided. Use --file`));
        process.exit(1);
    }

    if (!fs.existsSync(file)) {
        console.error(chalk.red(`❌ ${file} not found.`));
        process.exit(1);
    }
}

export function validateKey(key) {
    if (!key) {
        console.error(chalk.red(`❌ No key provided. Use --key`));
        process.exit(1);
    }
}