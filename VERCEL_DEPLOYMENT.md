# 🚀 Vercel Deployment Rehberi

AI Doctor backend'ini Vercel'e deploy etmek için adım adım rehber.

## 📋 Ön Hazırlık

Gerekli dosyalar:
- ✅ `vercel.json` - Vercel konfigürasyonu (hazır)
- ✅ `backend/.env.vercel` - Environment variables template (hazır)

## 🎯 Deployment Adımları

### 1. Vercel Hesabı Oluşturun

1. [vercel.com](https://vercel.com) adresine gidin
2. "Sign Up" ile ücretsiz hesap oluşturun
3. GitHub hesabınızla bağlanın

### 2. Yeni Proje Oluşturun

1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. GitHub repository seçin:
   - Repository: `srgnunlu/Aidoctor`
   - Branch: `claude/migrate-from-replit-011CUL9Mbzwh48zwPVtSZ8kW`
3. **Import** butonuna tıklayın

### 3. Proje Ayarlarını Yapın

**Framework Preset:** Other (Node.js seçilecek)

**Root Directory:** `backend` (önemli!)

**Build & Development Settings:**
- Build Command: `npm install` (varsayılan)
- Output Directory: bırakın boş
- Install Command: `npm install` (varsayılan)
- Development Command: `npm run dev` (varsayılan)

### 4. Environment Variables Ekleyin

**ÇOK ÖNEMLİ:** `backend/.env` dosyasındaki tüm değişkenleri ekleyin.

Vercel'de **Environment Variables** bölümüne gidin ve şunları ekleyin:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FIREBASE_SERVICE_ACCOUNT` | `backend/.env` dosyasındaki tam JSON (tek satır) |
| `FIREBASE_STORAGE_BUCKET` | `backend/.env` dosyasından kopyala |
| `FIREBASE_DATABASE_URL` | `backend/.env` dosyasından kopyala |
| `OPENAI_API_KEY` | `backend/.env` dosyasından kopyala |
| `GOOGLE_API_KEY` | `backend/.env` dosyasından kopyala |
| `CORS_ORIGIN` | `*` |

**Referans için:** `backend/.env.vercel.template` dosyasına bakabilirsiniz.

**Environment Seçimi:** Production, Preview, Development (hepsini seçin)

### 5. Deploy Edin!

1. **"Deploy"** butonuna tıklayın
2. Deployment başlayacak (2-3 dakika)
3. Tamamlandığında size bir URL verilecek:
   ```
   https://aidoctor.vercel.app
   ```

## ✅ Deployment Sonrası

### Backend URL'inizi Test Edin

```bash
curl https://aidoctor.vercel.app/health
```

Yanıt:
```json
{
  "status": "OK",
  "message": "AI-Doctor API is running",
  "timestamp": "2025-10-21T..."
}
```

### Mobile App'i Güncelleyin

`mobile/app.json` dosyasında:

```json
{
  "expo": {
    ...
    "extra": {
      "apiUrl": "https://aidoctor.vercel.app"
    }
  }
}
```

**Vercel URL'inizi buraya yazın!**

### Expo'ya Publish Edin

```bash
cd mobile
npx expo publish
```

## 🎯 Tamamlandı!

Artık:
- ✅ Backend Vercel'de çalışıyor (ücretsiz, otomatik SSL)
- ✅ Global CDN ile hızlı (tüm dünyadan erişilebilir)
- ✅ Otomatik deployment (her git push'ta)
- ✅ iPhone'dan test edebilirsiniz

## 📱 iPhone'da Test

1. App Store → **Expo Go** indirin
2. Expo Go'yu açın
3. Uygulamanızı açın (QR kod veya link)
4. Artık Vercel backend'e bağlı!

## 🔧 Sorun Giderme

### "Function Execution Timeout" Hatası

Vercel'de ücretsiz plan 10 saniye timeout'u var. Eğer AI işlemler uzun sürüyorsa:
- Pro plana yükseltin (daha uzun timeout)
- Veya AI işlemleri background'da çalıştırın

### Environment Variables Hatası

1. Vercel Dashboard → Settings → Environment Variables
2. `FIREBASE_SERVICE_ACCOUNT` tam ve tek satır olmalı
3. JSON'da çift tırnak karakterleri escape edilmemeli
4. Redeploy yapın: Deployments → ⋯ → Redeploy

### CORS Hatası

`backend/src/app.js` dosyasında CORS ayarlarını kontrol edin:

```javascript
app.use(cors({
  origin: '*',  // Veya belirli domainler
  credentials: true
}));
```

### Firebase Connection Hatası

Environment variables'da şunları kontrol edin:
- `FIREBASE_SERVICE_ACCOUNT` doğru mu?
- `FIREBASE_STORAGE_BUCKET` doğru mu?

Logs: Vercel Dashboard → Deployments → Function Logs

## 🔄 Güncelleme Yapmak

Kod değişikliği yaptığınızda:

1. GitHub'a push yapın:
   ```bash
   git push origin branch-name
   ```

2. Vercel **otomatik olarak** yeni deployment yapacak!

3. Mobile app güncellemesi için:
   ```bash
   cd mobile
   npx expo publish
   ```

## 💡 Vercel Avantajları

- ✅ **Ücretsiz SSL** (HTTPS otomatik)
- ✅ **Global CDN** (dünya çapında hızlı)
- ✅ **Otomatik Deployment** (git push = deploy)
- ✅ **Serverless Functions** (ölçeklenebilir)
- ✅ **Analytics** (kullanım istatistikleri)
- ✅ **Preview Deployments** (her branch ayrı URL)

## 📊 Limitler (Ücretsiz Plan)

- **Bandwidth:** 100 GB/ay
- **Function Execution:** 100 GB-Saat/ay
- **Function Duration:** 10 saniye max
- **Deployments:** Sınırsız

Çoğu test ve küçük projeler için yeterli!

## 🆘 Destek

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: https://github.com/srgnunlu/Aidoctor/issues

---

**Deployment başarılı olduğunda backend URL'inizi buraya not edin:**

```
Backend URL: https://aidoctor.vercel.app
Deploy Date: _______________
```

Artık her yerden erişebilirsiniz! 🎉
