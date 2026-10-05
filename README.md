# safekeeper 🔐  

**A simple, offline CLI tool to securely encrypt, decrypt, and manage `.env` files across teams .**  

Keep your environment secrets **safe, versioned, and easily shareable** without ever exposing sensitive data in Git.

> [!CAUTION]
> **Archived.** I built this as a learning project. A security review of my own code found a design flaw that breaks the encryption, so I've retired it instead of patching it. Don't use it for real secrets. See the [retrospective](#-retrospective) for what went wrong and what I'd do differently. If you need this kind of tool, use [dotenvx](https://github.com/dotenvx/dotenvx) or [SOPS](https://github.com/getsops/sops) with [age](https://github.com/FiloSottile/age).

---

## 🔍 Retrospective

### The critical flaw
To catch a wrong key early, I stored a SHA-256 hash of the key in each `.env.enc` header (`# key-hash:`). The AES key was also derived as `sha256(key)`, so that "hash" was the encryption key itself. Anyone with the `.env.enc` file could decrypt it without knowing the secret.

The check wasn't even needed: AES-GCM's auth tag already rejects a wrong key. I added a "safety" feature without working out what it gave away. That's the most useful lesson from this project.

### Other problems I found
- **Keystore protection is cosmetic.** `~/.safekeeper/keys.json` is encrypted with a master key hardcoded in the source, so anyone who reads the source can decrypt it.
- **Weak key derivation.** Passphrases go through a single unsalted SHA-256 instead of scrypt or Argon2id, so weak ones are cheap to brute-force.
- **Secrets leak through the CLI.** They can be passed as arguments (visible in shell history and `ps`), are echoed at prompts, and are printed to the terminal.
- **The concept doesn't solve the sharing problem.** One symmetric key per file still has to be passed around, and the only way to remove someone is to rotate everything.
- **Unreadable diffs.** The whole file is encrypted as one blob, so Git diffs and merges are useless.

### What I'd do differently
- **Use public-key encryption per recipient** (X25519, as in age): each teammate has their own keypair, so adding or removing someone means re-encrypting, not passing a shared secret around.
- **Encrypt each value separately** and leave variable names readable, so diffs and merges still work.
- **Store keys in the OS keychain** and never accept secrets as command-line arguments.
- **Build on audited primitives like age** instead of designing my own file format, then test against tampered and malformed files.

The rest of this README describes the tool as it was built.


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