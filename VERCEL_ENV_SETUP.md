# 🔥 Vercel Environment Variables - Adım Adım Rehber

## ❌ Sorun: 401 Unauthorized (Backend Firebase Token Doğrulayamıyor)

Backend Firebase token'ı doğrulayamıyor çünkü **FIREBASE_SERVICE_ACCOUNT** environment variable eksik veya yanlış.

---

## ✅ ÇÖZÜM: Environment Variables Ekleme

### 1️⃣ Backend .env Dosyasını Görüntüleyin

Terminal'de:

```bash
cd /workspaces/Aidoctor/backend
cat .env
```

**ÇOK ÖNEMLİ:** Çıktıyı KOPYALAYIN! Şöyle görünmeli:

```env
NODE_ENV=development
PORT=3001
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"aidoctor-5e9b2",...UZUN JSON...}
FIREBASE_STORAGE_BUCKET=aidoctor-5e9b2.firebasestorage.app
FIREBASE_DATABASE_URL=https://aidoctor-5e9b2-default-rtdb.firebaseio.com
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
CORS_ORIGIN=*
```

---

### 2️⃣ Vercel Dashboard'a Gidin

1. **Tarayıcıda:** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Login olun**
3. **Projenizi seçin:** `aidoctor`

---

### 3️⃣ Environment Variables Sayfasına Gidin

1. **Settings** (üst menüde)
2. Sol menüden **"Environment Variables"**

---

### 4️⃣ Her Environment Variable'ı Ekleyin

#### ⚠️ EN KRİTİK: FIREBASE_SERVICE_ACCOUNT

1. **Add New Variable** butonuna tıklayın
2. **Key:** `FIREBASE_SERVICE_ACCOUNT`
3. **Value:** `backend/.env` dosyasındaki JSON'u kopyalayın
   - **TEK SATIR** olmalı!
   - Başında `FIREBASE_SERVICE_ACCOUNT=` olmamalı
   - Sadece JSON: `{"type":"service_account",...}`
4. **Environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. **Save**

#### Diğer Variables:

Aynı şekilde şunları da ekleyin:

| Key | Value (backend/.env'den kopyala) |
|-----|-----------------------------------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FIREBASE_STORAGE_BUCKET` | `aidoctor-5e9b2.firebasestorage.app` |
| `FIREBASE_DATABASE_URL` | `https://aidoctor-5e9b2-default-rtdb.firebaseio.com` |
| `OPENAI_API_KEY` | `sk-proj-...` (tam key'i kopyala) |
| `GOOGLE_API_KEY` | `AIza...` (tam key'i kopyala) |
| `CORS_ORIGIN` | `*` |

**Toplam 8 variable olmalı!**

---

### 5️⃣ Redeploy Yapın

1. Sol menüden **"Deployments"**
2. En üstteki deployment'ı bulun
3. Sağındaki **⋯** (üç nokta) menü
4. **"Redeploy"**
5. "Use existing Build Cache" **KAPALI** olsun
6. **"Redeploy"** butonuna tıklayın

**2-3 dakika bekleyin** (deploy tamamlanana kadar)

---

### 6️⃣ Test Edin

Deploy tamamlandıktan sonra:

#### iPhone Safari'de:
```
https://aidoctor-ruddy.vercel.app/health
```

**Beklenen:**
```json
{"status":"OK","message":"AI-Doctor API is running",...}
```

#### Expo Go'da:
1. Uygulamayı **yeniden açın**
2. Giriş yapın
3. **Hasta ekleyin** → Artık çalışmalı! ✅
4. **AI analiz** deneyin → Çalışmalı! ✅

---

## 🔍 Environment Variables Doğru mu Kontrol

Vercel'de:
1. Settings → Environment Variables
2. **8 değişken var mı?** ✅
3. Her biri **Production + Preview + Development** seçili mi? ✅

Eksik olanlar varsa ekleyin ve redeploy yapın.

---

## 🆘 Hala 401 Hatası Alıyorsanız

### Vercel Logs Kontrol:

1. **Deployments** → En son deployment
2. **"Functions"** sekmesi
3. **"Logs"** altında hataları görün

Yaygın hatalar:
- `Firebase initialization error` → FIREBASE_SERVICE_ACCOUNT yanlış
- `Invalid token` → Environment değişkeni yok
- `Cannot read property` → Eksik env variable

---

## 💡 Özet Checklist

- [ ] `backend/.env` dosyasını okudum
- [ ] Vercel → Settings → Environment Variables
- [ ] 8 değişkeni ekledim
- [ ] FIREBASE_SERVICE_ACCOUNT tek satır JSON olarak eklendi
- [ ] Her değişken Production+Preview+Development seçili
- [ ] Redeploy yaptım (cache temizledim)
- [ ] 2-3 dakika bekledim
- [ ] Safari'de /health test ettim ✅
- [ ] Expo Go'da hasta eklemeyi denedim ✅

---

**Sonraki adım:** Vercel'e gidin, environment variables ekleyin, redeploy yapın!
