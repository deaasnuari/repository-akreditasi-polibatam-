# 📊 Data User untuk Testing

## 🔐 Kredensial Default dari Database

Berdasarkan file **[seed.js](../backend/prisma/seed.js)**, terdapat user default yang sudah dibuat:

### User Default (TU - Tata Usaha)

```javascript
Username: admin_tu
Email: admin@polibatam.ac.id
Password: admin123
Role: TU (Tata Usaha)
Status: aktif
```

## 📍 Lokasi Data User

### 1. **Database Schema** 
File: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma#L134)

```prisma
model users {
  id               Int       @id @default(autoincrement())
  username         String    @unique @db.VarChar(50)
  email            String    @unique @db.VarChar(100)
  password         String    @db.VarChar(255)      // Hashed dengan bcrypt
  nama_lengkap     String?   @db.VarChar(255)
  prodi            String?   @db.VarChar(255)
  photo            String?   @db.VarChar(500)
  role             String    @default("TU") @db.VarChar(20)
  status           String    @default("aktif") @db.VarChar(20)
  created_at       DateTime  @default(now())
  updated_at       DateTime  @default(now()) @updatedAt
}
```

**Roles Available:**
- `TU` - Tata Usaha
- `P4M` - P4M
- `Tim Akreditasi` - Tim Akreditasi

### 2. **Seed File (Data Awal)**
File: [backend/prisma/seed.js](../backend/prisma/seed.js#L130)

User default dibuat saat menjalankan seed:

```javascript
const defaultUser = await prisma.users.create({
  data: {
    username: "admin_tu",
    email: "admin@polibatam.ac.id",
    password: hashedPassword,      // bcrypt hash dari "admin123"
    nama_lengkap: "Administrator Tata Usaha",
    role: "TU",
    status: "aktif",
  },
});
```

### 3. **Auth Controller**
File: [backend/controllers/authController.js](../backend/controllers/authController.js)

Login logic menggunakan:
- Email atau username untuk authentication
- Bcrypt untuk verify password
- JWT untuk session management

## 🚀 Cara Melihat Data User

### Opsi 1: Menggunakan Database Client

**PostgreSQL (jika menggunakan psql):**
```sql
-- Connect ke database
psql -U your_username -d your_database

-- Lihat semua user
SELECT id, username, email, nama_lengkap, role, status 
FROM users;

-- Lihat user spesifik
SELECT * FROM users WHERE email = 'admin@polibatam.ac.id';
```

**Prisma Studio (GUI Database):**
```bash
cd backend
npx prisma studio
```
Buka browser di `http://localhost:5555` untuk melihat data visual.

### Opsi 2: Buat Script untuk List Users

Buat file `backend/list-users.js`:

```javascript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      nama_lengkap: true,
      role: true,
      status: true,
      created_at: true,
    },
  });

  console.log("\n📋 Daftar User:");
  console.log("="*50);
  
  users.forEach(user => {
    console.log(`
    ID: ${user.id}
    Username: ${user.username}
    Email: ${user.email}
    Nama: ${user.nama_lengkap || "-"}
    Role: ${user.role}
    Status: ${user.status}
    Created: ${user.created_at}
    ---
    `);
  });
  
  console.log(`\nTotal: ${users.length} users`);
  await prisma.$disconnect();
}

listUsers();
```

Jalankan:
```bash
cd backend
node list-users.js
```

### Opsi 3: Via Backend API

**Test Login Endpoint:**
```bash
# Menggunakan curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@polibatam.ac.id",
    "password": "admin123"
  }'

# Atau menggunakan PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin@polibatam.ac.id","password":"admin123"}'
```

## 🔧 Cara Menambah User Baru

### 1. Via Prisma Studio (GUI)
```bash
cd backend
npx prisma studio
```
- Buka `http://localhost:5555`
- Pilih model `users`
- Klik "Add record"
- Isi data (password harus di-hash dulu)

### 2. Via Script (Recommended)

Buat file `backend/create-user.js`:

```javascript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createUser(username, email, password, role, nama_lengkap) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        nama_lengkap,
        role,
        status: "aktif",
      },
    });

    console.log("✅ User created successfully!");
    console.log({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage
createUser(
  "admin_p4m",                    // username
  "p4m@polibatam.ac.id",         // email
  "p4m123",                       // password
  "P4M",                          // role
  "Administrator P4M"             // nama_lengkap
);
```

Jalankan:
```bash
cd backend
node create-user.js
```

### 3. Via SQL Direct

```sql
INSERT INTO users (username, email, password, nama_lengkap, role, status)
VALUES (
  'test_user',
  'test@polibatam.ac.id',
  '$2b$10$...',  -- Hash password dulu dengan bcrypt
  'Test User',
  'Tim Akreditasi',
  'aktif'
);
```

## 📝 Update Kredensial di Test Files

Setelah mengetahui kredensial yang benar, update di:

### 1. test_login.py (line ~23)
```python
VALID_EMAIL = "admin@polibatam.ac.id"
VALID_PASSWORD = "admin123"
```

### 2. test_login_pom.py (line ~18)
```python
VALID_EMAIL = "admin@polibatam.ac.id"
VALID_PASSWORD = "admin123"
```

### 3. test_selenium.py (line ~33)
```python
email_input.send_keys("admin@polibatam.ac.id")
password_input.send_keys("admin123")
```

## 🎯 Testing dengan Role Berbeda

Untuk test semua role, buat user untuk setiap role:

```javascript
// Role: TU (Sudah ada)
Email: admin@polibatam.ac.id
Password: admin123

// Role: P4M (Buat baru)
Email: p4m@polibatam.ac.id
Password: p4m123

// Role: Tim Akreditasi (Buat baru)
Email: timakreditasi@polibatam.ac.id
Password: tim123
```

## 🔍 Troubleshooting

### Password Tidak Cocok?
Password di database di-hash dengan bcrypt. Tidak bisa membaca password asli.
- Cek di seed.js untuk password default
- Atau reset password via script

### User Tidak Ada?
Jalankan seed database:
```bash
cd backend
npm run seed
# atau
npx prisma db seed
```

### Lupa Password?
Buat script reset password:

```javascript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.users.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log(`✅ Password for ${email} has been reset`);
  await prisma.$disconnect();
}

resetPassword("admin@polibatam.ac.id", "newpassword123");
```

## 📊 Summary

| Item | Value |
|------|-------|
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Password Hash** | bcrypt (salt rounds: 10) |
| **Default User** | admin_tu |
| **Default Email** | admin@polibatam.ac.id |
| **Default Password** | admin123 |
| **Default Role** | TU (Tata Usaha) |

## 🔗 File References

- Schema: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma#L134)
- Seed: [backend/prisma/seed.js](../backend/prisma/seed.js#L130)
- Auth Controller: [backend/controllers/authController.js](../backend/controllers/authController.js)
- Login Test: [selenium-tests/test_login.py](test_login.py#L23)

---

**🎯 Quick Answer:**

Data user ada di **database PostgreSQL**. Kredensial default:
- **Email:** `admin@polibatam.ac.id`
- **Password:** `admin123`
- **Role:** `TU`

Lihat di file **[backend/prisma/seed.js](../backend/prisma/seed.js#L156)** untuk kredensial lengkap!
