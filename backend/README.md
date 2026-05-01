# 🔗 LostLink — Backend API

Production-ready Node.js + Express backend for the LostLink Lost & Found platform.

## 🚀 Supabase Project

| Field    | Value                                      |
|----------|--------------------------------------------|
| Project  | LostLink                                   |
| URL      | https://biljsanhifmkrmskobxr.supabase.co  |
| Region   | ap-south-1 (Mumbai)                       |
| Status   | ✅ Active                                  |

## 🗂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabaseClient.js      # Supabase client (public + admin)
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, login, logout, me
│   │   ├── items.controller.js    # CRUD for lost/found items
│   │   ├── claims.controller.js   # Claim lifecycle
│   │   ├── qr.controller.js       # QR generation & fetch
│   │   ├── notifications.controller.js
│   │   └── admin.controller.js    # Admin dashboard
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── items.routes.js
│   │   ├── claims.routes.js
│   │   ├── qr.routes.js
│   │   ├── notifications.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── matching.service.js    # Rule-based + text similarity matching
│   │   ├── qr.service.js          # QR code generation + Supabase Storage
│   │   ├── notification.service.js # Email (Nodemailer) + DB notifications
│   │   └── storage.service.js     # Supabase Storage helpers
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── role.middleware.js     # RBAC
│   │   ├── upload.middleware.js   # Multer memory storage
│   │   └── validation.middleware.js
│   ├── __tests__/
│   │   ├── matching.test.js
│   │   └── api.test.js
│   ├── app.js                     # Express setup
│   └── server.js                  # HTTP + Socket.io
├── schema.sql                     # Database schema reference
├── .env.example
└── package.json
```

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/LostLink.git
cd LostLink/backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
SUPABASE_URL=https://biljsanhifmkrmskobxr.supabase.co
SUPABASE_ANON_KEY=<from Supabase dashboard → Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard → Settings → API>
SUPABASE_JWT_SECRET=<from Supabase dashboard → Settings → API → JWT Secret>
PORT=5000
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3. Create Supabase Storage Buckets

In your Supabase dashboard → Storage → Create buckets:
- `items` (public)
- `qrcodes` (public)

### 4. Run

```bash
npm run dev       # development with nodemon
npm start         # production
npm test          # run tests
```

## 📡 API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | Login, returns JWT |
| POST | /auth/logout | ✅ | Logout |
| GET | /auth/me | ✅ | Get current user |
| POST | /auth/refresh | ❌ | Refresh access token |

### Items
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /items | ❌ | Browse items (filterable) |
| GET | /items/:id | ❌ | Get item details |
| GET | /items/:id/matches | ❌ | Get AI matches |
| POST | /items/lost | ✅ | Report lost item |
| POST | /items/found | ✅ | Report found item |
| PATCH | /items/:id | ✅ | Update item |
| DELETE | /items/:id | ✅ | Delete item |

### Claims
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /claims | ✅ | Submit a claim |
| GET | /claims | ✅ | Get my claims |
| PATCH | /claims/:id | ✅ | Accept/reject claim |
| PATCH | /claims/:id/resolve | ✅ | Mark resolved |

### QR Codes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /qr/:itemId | ✅ | Generate QR |
| GET | /qr/:itemId | ❌ | Get QR for item |

### Notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /notifications | ✅ | Get my notifications |
| PATCH | /notifications/read-all | ✅ | Mark all read |
| PATCH | /notifications/:id/read | ✅ | Mark one read |

### Admin
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | /admin/stats | ✅ | admin |
| GET | /admin/users | ✅ | admin |
| PATCH | /admin/users/:id/role | ✅ | admin |
| DELETE | /admin/users/:id | ✅ | admin |
| GET | /admin/items | ✅ | admin |
| DELETE | /admin/items/:id | ✅ | admin |
| GET | /admin/claims | ✅ | admin |
| PATCH | /admin/claims/:id | ✅ | admin |

## 🔌 Socket.io (Realtime)

Connect from frontend:
```js
const socket = io('http://localhost:5000');
socket.emit('join', userId); // join personal notification room
```

## 🧠 Matching Algorithm

Scores 0–1 using:
- **Category match** → +0.4
- **Location overlap** → +0.3
- **Description similarity** (Jaccard) → +0.3 × similarity

Items scoring ≥ 0.4 are stored as matches and the owner is notified.
