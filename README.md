# envman 🔐

**A simple, secure CLI tool to manage and share `.env` files across teams**

---

## ⭐️ Why envman?

Managing `.env` files across a team can be challenging:

- **Device changes or migration:** `.env` files may be lost or misplaced when switching devices.  
- **Forgotten updates:** Team members might run the app with outdated or missing environment variables.  
- **Accidental exposure:** Committing `.env` files can inadvertently leak secrets.  
- **Manual sharing hassle:** Sending `.env` files via chat or email is error-prone and insecure.  
- **Cost constraints:** Not all teams can afford dedicated environment management services.  

**envman solves these problems** by:

- Maintaining a single source of truth that can be safely pulled and decrypted on any device.  
- Encrypting `.env` files securely to prevent accidental leaks.  
- Supporting multiple environment files (`.env.local`, `.env.prod`, etc.) alongside your source code.  
- Eliminating manual sharing - files can be versioned via Git or any VCS.  
- Providing a free, offline, lightweight CLI tool for effective environment management without additional costs.  

> With envman, sharing, syncing, and managing environment variables becomes **secure, reliable, and hassle-free**.

---

## ✨ Features
- Encrypt any `.env` file with AES256 encryption.  
- Auto-generate a secure key or use a custom key.  
- Supports multiple environment files (`.env.local`, `.env.prod`, etc.).  
- Key-hash verification ensures safe decryption.  
- Includes file metadata (version, creation date) in encrypted files.  
- Prevents invalid key decryption and corrupted `.env` files.  

---

## 🚀 Installation
```bash
# Install dependencies
npm install -g envman
```
---

## 🎥 Usage

### Encrypt
```bash
# Encrypt with auto-generated key
envman encrypt --file .env.local

# Encrypt with custom key
envman encrypt --file .env.local --key mysecretkey
```

### Decrypt
```bash
# Decrypt using key
envman decrypt --file .env.local.enc --key mysecretkey
```