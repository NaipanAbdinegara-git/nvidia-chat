# Deploy ke Vercel (Hobby / Free Plan)

## Sudah dikonfigurasi untuk Vercel Hobby ✅

Semua timeout sudah disesuaikan untuk Vercel Hobby (free):
- `maxDuration = 60` detik (Hobby max)
- Server timeout: 55 detik
- Client chunk timeout: 50 detik

---

## Cara Deploy

### Step 1: Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### Step 2: Import di Vercel
1. Buka https://vercel.com/new
2. Import repository GitHub kamu
3. Framework: **Next.js** (auto-detect)

### Step 3: Set Environment Variables
Di Vercel Dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `NVIDIA_API_KEY` | `nvapi-xxx...` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | dari Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `xxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `xxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123...` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:xxx:web:xxx` |

> ⚠️ `NVIDIA_API_KEY` **tanpa** prefix `NEXT_PUBLIC_` — ini server-only!

### Step 4: Deploy
Klik Deploy. Selesai!

---

## Rekomendasi Model untuk Hobby Plan

Karena limit 60 detik, gunakan model yang lebih kecil / cepat:

| Model | TTFT | Rekomendasi |
|-------|------|-------------|
| `meta/llama-3.1-8b-instruct` | ~3-5s | ⭐ Terbaik untuk Hobby |
| `mistralai/mistral-7b-instruct-v0.3` | ~3-5s | ⭐ Cepat & pintar |
| `google/gemma-3n-e4b-it` | ~5-8s | ✅ Ringan, support vision |
| `meta/llama-3.1-70b-instruct` | ~15-30s | ⚠️ Bisa timeout di Hobby |
| `nvidia/nemotron-4-340b-instruct` | ~30-60s | ❌ Tidak cocok Hobby |

---

## Firebase Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
