# safekeeper 🔐

**A simple and secure CLI tool for safely managing and sharing .env files alongside your code across teams.**  

With safekeeper, you can **encrypt your `.env` files** so they can be safely stored in your repository using Git or VCS without risking accidental leaks.

---

## ⭐️ Why safekeeper?

Managing `.env` files across a team can be challenging:

- **Device changes or migration:** `.env` files may be lost or misplaced when switching devices.  
- **Forgotten updates:** Team members might run the app with outdated or missing environment variables.
- **Manual sharing hassle:** Sending `.env` files via chat or email is error-prone and insecure.  
- **Cost constraints:** Not all teams can afford dedicated environment management services.  

**safekeeper solves these problems** by:

- Maintaining a single encrypted source of truth that can be safely pulled and decrypted on any device.  
- Store and manage `.env` files alongside your code using Git or any version control system.   
- Remove the need for manual sharing—files are versioned automatically via Git or VCS.
- Offer a free, offline, lightweight CLI for simple and cost-effective environment management.

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
# Install dependencies globally
npm install -g safekeeper
```

---

## 🎥 Usage

### Encrypt
```bash
# Encrypt with auto-generated key
safekeeper encrypt --file .env.local

# Encrypt with custom key
safekeeper encrypt --file .env.local --key mysecretkey
```

### Decrypt
```bash
# Decrypt using key
safekeeper decrypt --file .env.local.enc --key mysecretkey
```

## 📄 License

This project is licensed under the MIT License.