# Watermark Remover Pro

AI-powered watermark removal SaaS. Built with Next.js 15, Prisma, and OpenCV.js.

## ✨ Features
- 🎯 Auto-detect watermarks using edge detection + inpainting (browser-based, free!)
- 🖼️ Before/After slider comparison
- 👤 Email/password authentication
- 💳 Stripe subscriptions (Pro & Business plans) — _ready to integrate_
- 📊 Dashboard with history, billing, profile
- 🌑 Modern dark mode UI with glassmorphism
- 📱 Mobile responsive
- 🔒 Rate limiting + secure cookies

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes (Node runtime)
- **Database**: PostgreSQL (production) / SQLite (development)
- **ORM**: Prisma 5
- **Auth**: Custom cookie-based session + bcrypt
- **AI**: OpenCV.js (browser-based, free!)
- **Storage**: Local `public/uploads/` (production: S3/Cloudinary)
- **Payments**: Stripe (optional, ready to integrate)

## 🚀 Quick Start (Local Development)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up database
The default `.env` uses SQLite. To switch to PostgreSQL, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### 3. Run database migrations
```bash
npx prisma generate
npx prisma db push
```

### 4. Start dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production
```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel
See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions in Bangla/English.

## 📁 Project Structure
```
app/
  ├── (marketing pages)
  ├── dashboard/        ← User dashboard (overview, history, billing, profile)
  ├── api/              ← API routes
  └── layout.tsx        ← Root layout with SEO metadata

components/
  ├── navbar.tsx
  ├── footer.tsx
  ├── dashboard-sidebar.tsx
  └── image-editor.tsx  ← OpenCV.js based watermark removal

lib/
  ├── auth.ts           ← Session + bcrypt helpers
  ├── prisma.ts         ← Prisma singleton
  └── image-storage.ts  ← File save/delete

prisma/
  ├── schema.prisma           ← SQLite (dev)
  └── schema.production.prisma ← PostgreSQL (prod)
```

## 🔐 Environment Variables
See `.env.example` for the full list. Required variables:
- `DATABASE_URL` — Database connection string
- `NEXTAUTH_SECRET` — Random string for session signing

Optional (for Stripe):
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_*` (4 price IDs)

## 🧪 Testing
```bash
# Register a test user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' \
  -c cookies.txt

# Upload image (requires auth cookie)
curl -X POST http://localhost:3000/api/upload \
  -b cookies.txt \
  -F "file=@/path/to/image.png"
```

## 📝 License
MIT

## 💡 Notes
- **OpenCV.js** loads from CDN on first use (~10MB cached after that)
- **SQLite** is for local dev only — production uses PostgreSQL
- **Stripe** is ready but optional — system runs fully without it
- **Admin panel** not included in this version — can be added later