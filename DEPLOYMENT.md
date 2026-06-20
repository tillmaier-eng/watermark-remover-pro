# Vercel এ Deploy করার নির্দেশনা (বাংলায়)

## 📋 আগে যা যা দরকার

আপনার লাগবে:
1. ✅ একটা **GitHub account** (github.com এ signup করুন)
2. ✅ একটা **Vercel account** (vercel.com এ GitHub দিয়ে signup)
3. ✅ একটা **Neon.tech account** (নিখরচায় PostgreSQL database)

---

## Step 1: Neon.tech এ Database তৈরি (৫ মিনিট)

1. https://neon.tech যান
2. **Sign up** করুন (GitHub দিয়ে সবচেয়ে সহজ)
3. **Create a project** এ click করুন
   - Project name: `watermark-remover-pro`
   - Region: `US East (Ohio)` সবচেয়ে ভালো Vercel এর জন্য
   - PostgreSQL version: 16 (default)
4. Create এ click করুন
5. **Connection string** copy করুন:
   - দেখবেন: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - এটা সংরক্ষণ করুন — পরে লাগবে

⚠️ **গুরুত্বপূর্ণ**: Connection string এর শেষে `?sslmode=require` আছে কিনা দেখুন

---

## Step 2: GitHub এ Code Push (৩ মিনিট)

### Option A: আপনি যদি Git ব্যবহার জানেন

Terminal এ:
```bash
cd watermark-remover-pro
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/watermark-remover-pro.git
git push -u origin main
```

### Option B: GitHub Desktop ব্যবহার করুন (সহজ)

1. https://desktop.github.com থেকে GitHub Desktop download করুন
2. Install করে GitHub account এ login করুন
3. **File → Add Local Repository** → আপনার project folder select করুন
4. **Commit to main** button এ click করুন
5. **Publish repository** button এ click করুন
6. Public/Unpublic রাখুন → Publish

---

## Step 3: Vercel এ Deploy (৫ মিনিট)

1. https://vercel.com যান → **Sign in with GitHub**
2. **Add New Project** button এ click করুন
3. আপনার `watermark-remover-pro` repository টা select করুন
4. **Import** এ click করুন

### Configuration:

**Framework Preset**: Next.js (auto-detect হবে)

**Build & Output Settings**:
- Build Command: `prisma generate && next build` (আমাদের vercel.json এ already আছে)
- Output Directory: `.next` (default)

**Root Directory**: `./` (default)

### Environment Variables:

**"Environment Variables"** section এ নিচেরগুলো add করুন:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon.tech এর connection string (Step 1 এর) |
| `NEXTAUTH_SECRET` | random string (নিচে দেখুন কিভাবে বানাবেন) |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` (প্রথমে deploy হলে পাবেন) |
| `NEXT_PUBLIC_APP_URL` | same as above |

#### NEXTAUTH_SECRET বানানোর উপায়:

PowerShell এ:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

এটা একটা random string দেবে — copy করে `NEXTAUTH_SECRET` এ paste করুন।

### Optional (Stripe — পরে যোগ করবেন):

এগুলো এখন skip করুন। পরে billing চালু করতে চাইলে যোগ করবেন:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_*`

---

## Step 4: Deploy!

1. **Deploy** button এ click করুন
2. অপেক্ষা করুন (১-২ মিনিট)
3. ✅ "Congratulations!" দেখলে deploy successful!
4. আপনার URL পাবেন: `https://watermark-remover-pro-xxx.vercel.app`

---

## Step 5: Database Schema Apply

Vercel terminal এ যান অথবা local এ:

```bash
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

অথবা Vercel এর "Deployments" → সবশেষ deployment → "View Function Logs" এ দেখুন schema apply হয়েছে কিনা।

---

## Step 6: Test

১. আপনার Vercel URL এ যান
২. **Sign up** করুন নতুন email দিয়ে
৩. **Dashboard** এ যান
৪. একটা ছবি upload করুন
৫. "Remove watermark" এ click করুন
৬. ✅ কাজ করলে সব ঠিক আছে!

---

## ⚠️ সমস্যা ও সমাধান

### "Database connection failed"
- Neon.tech connection string ঠিক আছে কিনা দেখুন
- `?sslmode=require` আছে কিনা
- Vercel project settings এ `DATABASE_URL` সঠিক আছে কিনা

### "Prisma Client not generated"
- vercel.json এ `buildCommand` আছে: `prisma generate && next build`
- Redeploy করুন: Deployments → ... → Redeploy

### "OpenCV.js failed to load"
- এটা CDN থেকে load হয় — internet connection check করুন
- প্রথম load এ ~10 সেকেন্ড লাগে, পরে instant

### ভুল NEXTAUTH_SECRET
- Login কাজ করবে না
- নতুন secret generate করে redeploy করুন

---

## 🔄 পরে কিভাবে Stripe যোগ করবেন

1. https://stripe.com এ account খুলুন
2. Test mode এ 2 products তৈরি করুন (Pro $9.99, Business $29)
3. API keys নিন (Dashboard → Developers)
4. Vercel → Project Settings → Environment Variables এ 6টা Stripe variable যোগ করুন
5. আমাকে বলুন "Stripe add করো" — আমি route গুলো লিখে দেব

---

## 💰 Vercel Free Tier Limits

- ✅ ১০০ GB bandwidth/মাস
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ Serverless function execution: ১০ সেকেন্ড/function (আমাদের AI client-side, তাই OK)

আপনার site যদি বেশি popular হয়, তাহলে $20/month Pro plan এ যেতে পারেন।

---

## 🎉 সম্পন্ন!

Deploy successful হলে:
- 🌍 আপনার সাইট live: `https://your-app.vercel.app`
- 🔒 HTTPS automatic
- 🚀 Global CDN দিয়ে fast loading
- 📱 Mobile friendly
- 🔄 Git push করলে automatic redeploy

---

## 📞 সাহায্য দরকার?

যদি কোনো step এ আটকে যান:
1. Error message টা আমাকে paste করুন
2. আমি fix করে দেব
3. কোনো technical জ্ঞান দরকার নেই — শুধু step follow করুন