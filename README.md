# safekeeper 🔐  

**A simple, offline CLI tool to securely encrypt, decrypt, and manage `.env` files across teams .**  

Keep your environment secrets **safe, versioned, and easily shareable** without ever exposing sensitive data in Git.

> <span style="color:red;">⚠️ Note:</span> 
> <span style="color:red;">Do not use this tool in production systems or public repositories yet.</span> safekeeper is currently in its early development stage. It is intended only for local development and testing purposes until it undergoes further security audits and stability improvements.


---

## ⭐️ Why safekeeper?

Managing `.env` files in a team is messy and insecure:

- 🧑‍💻 **Device changes or migrations:** Files get lost when switching machines.  
- ⚠️ **Out-of-sync environments:** Developers often run outdated `.env` values.  
- 💬 **Manual sharing hassle:** Passing `.env` via chat or email is risky.  
- 💸 **Cost constraints:** Most environment managers are paid SaaS tools.

### safekeeper fixes all this by:
- 🔐 Maintaining a single encrypted `.env` file that can be committed to Git.  
- 🧩 Allowing team members to decrypt safely using stored keys.  
- 💾 Keeping all encryption keys securely stored on your local machine.  
- 🪶 Remaining completely free, offline, and lightweight.  

---

## ✨ Features

- AES-256-GCM encryption with authentication tag.  
- Auto-generate or provide your own encryption key.  
- Named key management via `key:set`, `key:get`, `key:list`, and `key:delete`.  
- Safe key re-use - encrypt and decrypt just by referencing the key name.  
- Secure local key storage (`~/.safekeeper/keys.json`).  
- Seamless Git integration - safely commit `.env.enc` files to repos.  

---

## 🚀 Installation

```bash
npm install -g safekeeper
```
---

## 🎥 Usage

### 🔒 Encrypt a file
```bash
# Interactive mode (recommended)
safekeeper encrypt
```
You’ll be prompted for:
- Path to the .env file
- Key name (used to store and reference the key later)
- Secret key (optional — auto-generated if skipped)

### Decrypt
```bash
# Decrypt using key
safekeeper decrypt
```
You’ll be prompted for:
- Path to the .env.enc file
- Key name (used to fetch the stored key)

## 🗝️ Key Management
Safekeeper also includes a built-in encrypted local keystore (`~/.safekeeper/keys.json`) for easy reuse.

### Add or update a key
```bash
safekeeper key:set
```

### Retrieve a key
```bash
safekeeper key:get
```

### List all keys
```bash
safekeeper key:list
```

### Delete a key
```bash
safekeeper key:delete
```

## 📄 License

This project is licensed under the MIT License.