## 🛡️ Express-Brute-Guard

A lightweight, customizable, and production-ready rate-limiting middleware for Node.js, designed to protect APIs from brute-force and abuse attacks. Built with in-memory storage and optional headers, with support for auto-cleanup of expired IP entries.

---

### 🚀 Features

- 🔒 Per-IP rate limiting
- ⏲️ Configurable request window and block duration
- ⚡ Fast in-memory store
- 📡 Customizable response headers
- 🧹 Auto cleanup of expired entries (no cron needed)
- 🧱 Pluggable store system (Redis/DB support planned for v2)

---

### 📦 Installation

```bash
bash

npm install express-brute-guard

```

---

### 📚 Usage

```
typescript

import express from 'express';
import { BruteGuard } from 'express-brute-guard';

const app = express();

const bruteGuard = new BruteGuard({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
  blockDuration: 5 * 60 * 1000, // 5 minutes
  errormessage: 'Too many attempts. Please try again later.',
  headers: true, // Add X-RateLimit-* headers
});

// Apply middleware
app.use((req, res, next) => bruteGuard.createGuard(req, res, next));

// Your routes
app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.listen(3000, () => console.log('Server running on port 3000'));

```

### 📦 Default Export (Plug & Play Middleware)

If you just want to use BruteGuard with default or minimal config:

```
typescript

import bruteGuard from 'express-brute-guard';
import express from 'express';

const app = express();

// Apply brute-force protection globally
app.use(bruteGuard.createGuard());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

```

> ✅ Best for: Quick setup and global protection.

### ⚙️ Named Export (Custom Configs per Route)

If you need custom configurations (e.g., different rate limits per route):

```
typescript

import { BruteGuard } from 'express-brute-guard';
import express from 'express';

const app = express();

// Create multiple instances with custom configs
const loginLimiter = new BruteGuard({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
});

const signupLimiter = new BruteGuard({
  maxRequests: 2,
  windowMs: 5 * 60 * 1000, // 5 minutes
});

// Apply per-route brute-force protection
app.post('/login', loginLimiter.createGuard(), (req, res) => {
  res.send('Login route');
});

app.post('/signup', signupLimiter.createGuard(), (req, res) => {
  res.send('Signup route');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

```

> 🔧 Best for: Apps needing fine-grained control, customization, or testing.

---

### ⚙️ Options

| Option          | Type      | Default               | Description                                           |
| --------------- | --------- | --------------------- | ----------------------------------------------------- |
| `maxRequests`   | `number`  | `10`                  | Max requests allowed before blocking                  |
| `windowMs`      | `number`  | `5 * 60 * 1000`       | Time window for tracking requests (in ms)             |
| `blockDuration` | `number`  | `3 * 60 * 1000`       | How long to block the IP after limit exceeded (in ms) |
| `statusCode`    | `number`  | `429`                 | HTTP status code for blocked requests                 |
| `errormessage`  | `string`  | `'Too many Requests'` | Message shown when limit is exceeded                  |
| `headers`       | `boolean` | `true`                | Whether to set rate-limit headers                     |
| `store`         | `any`     | `memoryStore`         | Optional custom store (e.g., Redis support in v2)     |

---

### 🧠 How It Works

- Each IP gets tracked on request.
- If requests exceed `maxRequests` in `windowMs`, IP is **temporarily blocked**.
- If an entry expires, it is automatically **cleaned up** by a background process using `setInterval`.

---

### 🔮 Coming in v2

- ✅ Redis store support
- ✅ Sliding window algorithm
- ✅ Per-route configuration
- ✅ Type-safe middleware usage
- ✅ Dashboard / monitoring integration

---

### 🧪 Testing

Basic test setup (optional):

```bash
bash
npm install --save-dev jest supertest

```

You can write tests to validate:

- Blocking after limit
- Reset after window
- Cleanup behavior

---

## 🤝 Contributing

PRs and feature requests are welcome! Open issues or reach out via GitHub.

### 🧑‍💻 Author

Developed by [Taran Mesala](https://github.com/Taran1508)

For support or feature requests, open an issue.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
