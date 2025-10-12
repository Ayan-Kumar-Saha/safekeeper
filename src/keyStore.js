import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import chalk from 'chalk';

const STORE_FILE = path.join(os.homedir(), '.safekeeper', 'keys.json');
const ALGO = 'aes-256-gcm';

function ensureStore() {
    fs.ensureFileSync(STORE_FILE);
    if (!fs.existsSync(STORE_FILE) || fs.readFileSync(STORE_FILE, 'utf-8').trim() === '') {
        fs.writeFileSync(STORE_FILE, JSON.stringify({}, null, 2));
    }
}

function encryptValue(value, masterKey) {
    const iv = crypto.randomBytes(12);
    const key = crypto.createHash('sha256').update(masterKey).digest();
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

function decryptValue(payload, masterKey) {
    try {
        const buffer = Buffer.from(payload, 'base64');
        const iv = buffer.subarray(0, 12);
        const tag = buffer.subarray(buffer.length - 16);
        const encrypted = buffer.subarray(12, buffer.length - 16);
        const key = crypto.createHash('sha256').update(masterKey).digest();
        const decipher = crypto.createDecipheriv(ALGO, key, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    } catch (err) {
        console.error(chalk.red(`❌ Decryption failed. Invalid key or corrupted file.`));
        process.exit(1);
    }
}

export function saveKey(name, value, masterKey) {
    ensureStore();
    const store = fs.readJSONSync(STORE_FILE);
    store[name] = encryptValue(value, masterKey);
    fs.writeJSONSync(STORE_FILE, store, { spaces: 2 });
}

export function getKey(name, masterKey) {
    ensureStore();
    const store = fs.readJSONSync(STORE_FILE);
    if (!store[name]) return null;
    return decryptValue(store[name], masterKey);
}

export function listKeys() {
    ensureStore();
    const store = fs.readJSONSync(STORE_FILE);
    return Object.keys(store);
}

export function deleteKey(name) {
    ensureStore();
    const store = fs.readJSONSync(STORE_FILE);
    if (store[name]) {
        delete store[name];
        fs.writeJSONSync(STORE_FILE, store, { spaces: 2 });
    }
}


export function keyExists(name) {
    ensureStore();
    const store = fs.readJSONSync(STORE_FILE);
    return !!store[name];
}
