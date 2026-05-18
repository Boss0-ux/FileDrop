# 🗂️ FileDrop v2.0 — PostgreSQL Edition

A WeTransfer-like file sharing platform backed by PostgreSQL.

---

## 📁 Project Structure

```
filedrop/
├── server.js                 ← Entry point, starts the app
├── package.json              ← Dependencies
├── .env.example              ← Copy this to .env and fill in values
│
├── database/
│   ├── schema.sql            ← Run this ONCE in pgAdmin to create tables
│   └── seed.js               ← Run to verify your DB is set up correctly
│
├── utils/
│   ├── db.js                 ← PostgreSQL connection pool (all routes import this)
│   ├── mailer.js             ← Sends OTP emails via Gmail
│   └── otp.js                ← Generates and verifies OTP codes (in-memory)
│
├── middleware/
│   └── auth.js               ← Protects routes (requireAuth, requireAdmin)
│
├── routes/
│   ├── main.js               ← Serves HTML pages (/, /download/:id)
│   ├── auth.js               ← Login, register, OTP, forgot/reset password
│   ├── api.js                ← File upload and download endpoints
│   ├── admin.js              ← Admin dashboard API
│   └── user.js               ← User dashboard API
│
└── public/
    ├── index.html            ← Main upload page
    ├── download.html         ← Download page
    ├── login.html            ← Login + Register tabs
    ├── verify-otp.html       ← OTP entry page
    ├── forgot-password.html  ← Forgot password page
    ├── reset-password.html   ← New password page
    ├── dashboard.html        ← User's transfer history
    ├── admin.html            ← Admin panel
    └── uploads/              ← Uploaded files stored here
```

---

## 🚀 Setup Guide (Step by Step)

### STEP 1 — Install Node.js
Download from https://nodejs.org (LTS version) and install.

### STEP 2 — Install PostgreSQL
Download from https://www.postgresql.org/download/windows
- Keep default port: 5432
- Set a password for the `postgres` user — REMEMBER IT
- Also install pgAdmin 4 (selected by default)

### STEP 3 — Create the Database
Open **pgAdmin 4** from Start menu:
1. Expand: Servers → PostgreSQL → right-click "Databases"
2. Click "Create" → "Database"
3. Name: `filedrop` → Save

OR in SQL Shell (psql):
```sql
CREATE DATABASE filedrop;
```

### STEP 4 — Create the Tables
In pgAdmin:
1. Click your `filedrop` database
2. Click "Tools" → "Query Tool"
3. Open the file `database/schema.sql` (File → Open)
4. Press F5 (or the ▶ Run button)
5. You should see "Query returned successfully"

### STEP 5 — Configure Your .env File
Copy `.env.example` → rename to `.env`, then edit it:
```
PORT=3000
SESSION_SECRET=any-long-random-string-here

DB_HOST=localhost
DB_PORT=5432
DB_NAME=filedrop
DB_USER=postgres
DB_PASS=your_postgres_password_here

SMTP_USER=yourgmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### STEP 6 — Install Node Packages
Open VS Code in the filedrop folder, then in terminal:
```
npm install
```

### STEP 7 — Verify Database
```
npm run db:check
```
You should see all 4 tables listed with ✅ next to each.

### STEP 8 — Start the App
```
node server.js
```

You will see:
```
✅ PostgreSQL connected — server time: 2024-...
🚀 FileDrop running at http://localhost:3000
```

---

## 🌐 URLs

| URL                      | What it is            |
|--------------------------|-----------------------|
| http://localhost:3000    | Main upload page      |
| /auth/login              | Login / Register      |
| /auth/forgot-password    | Forgot password       |
| /user/dashboard          | Your transfer history |
| /admin                   | Admin panel           |

**Default admin:** username `admin` / password `password`

---

## 🗄️ Database Tables

| Table       | What it stores                              |
|-------------|---------------------------------------------|
| `users`     | All accounts (admin + regular users)        |
| `transfers` | Each file-sharing link created              |
| `files`     | Individual files within each transfer       |
| `settings`  | Admin-controlled config (expiry, size, etc) |

### Useful SQL queries to inspect your data:
```sql
-- See all users
SELECT username, email, role, verified FROM users;

-- See all transfers
SELECT id, title, sender_email, downloads, expires_at FROM transfers ORDER BY created_at DESC;

-- See files in a transfer
SELECT original_name, size FROM files WHERE transfer_id = 'your-transfer-id';

-- See settings
SELECT * FROM settings;
```

---

## 🔧 Common Errors

**Cannot connect to PostgreSQL**
- Make sure PostgreSQL service is running (search "Services" in Windows Start)
- Check DB_PASS in your .env matches what you set during install

**npm install fails**
- Make sure you're inside the `filedrop` folder
- Run `dir` in terminal — you should see `package.json`

**OTP emails not sending**
- Make sure SMTP_USER and SMTP_PASS are set in .env
- Use a Gmail App Password, not your real Gmail password

---

## 💾 Backup Your Database
```
pg_dump -U postgres filedrop > backup.sql
```

## ♻️ Restore from Backup
```
psql -U postgres filedrop < backup.sql
```
