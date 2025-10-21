# 🔍 Backend Sorun Giderme Rehberi

Uygulamanız çalışıyor ama AI ve veritabanı özellikleri çalışmıyor. İşte kontrol edilmesi gerekenler:

## 1️⃣ Backend Çalışıyor mu? (Hızlı Test)

### iPhone Safari'de Açın:

```
https://aidoctor-ruddy.vercel.app/health
```

**Beklenen sonuç:**
```json
{
  "status": "OK",
  "message": "AI-Doctor API is running",
  "timestamp": "..."
}
```

**Eğer bu çalışmıyorsa:** Backend'de sorun var ⬇️

---

## 2️⃣ Vercel Environment Variables Kontrol

### Yapmanız Gerekenler:

1. **Vercel Dashboard'a gidin:**
   - [vercel.com/dashboard](https://vercel.com/dashboard)
   - Projenizi seçin: `aidoctor`

2. **Settings → Environment Variables:**
   - Sol menüden **"Settings"**
   - **"Environment Variables"** sekmesi

3. **Şu değişkenlerin HEPSİ olmalı:**

| Variable | Değer Kontrolü |
|----------|---------------|
| `NODE_ENV` | `production` ✅ |
| `PORT` | `3001` ✅ |
| `FIREBASE_SERVICE_ACCOUNT` | Uzun JSON metni (tek satır) ⚠️ |
| `FIREBASE_STORAGE_BUCKET` | `aidoctor-5e9b2.firebasestorage.app` ✅ |
| `FIREBASE_DATABASE_URL` | `https://aidoctor-5e9b2-default-rtdb.firebaseio.com` ✅ |
| `OPENAI_API_KEY` | `sk-proj-...` ile başlamalı ⚠️ |
| `GOOGLE_API_KEY` | `AIza...` ile başlamalı ⚠️ |
| `CORS_ORIGIN` | `*` ✅ |

### ⚠️ En Kritik Olanlar:

**FIREBASE_SERVICE_ACCOUNT:**
- TEK SATIR olmalı
- JSON formatında
- Başında/sonunda boşluk olmamalı
- Bilgisayarınızda `backend/.env` dosyasını açın
- `FIREBASE_SERVICE_ACCOUNT=...` satırını kopyalayın
- Vercel'e yapıştırın

**OPENAI_API_KEY:**
- `sk-proj-` ile başlamalı
- 200+ karakter uzunluğunda
- `backend/.env` dosyasından kopyalayın

---

## 3️⃣ Vercel Logs Kontrol

### Hataları Görmek İçin:

1. **Vercel Dashboard → Projeniz**
2. **"Deployments"** sekmesi
3. En son deployment'a tıklayın
4. **"Functions"** sekmesi
5. **"Logs"** altında hataları görün

### Yaygın Hatalar:

**"Firebase initialization error"** → `FIREBASE_SERVICE_ACCOUNT` yanlış

**"OpenAI API error"** → `OPENAI_API_KEY` eksik veya yanlış

**"Cannot read property"** → Bir env variable eksik

---

## 4️⃣ Environment Variables Eksildi mi?

### Hızlı Ekleme:

1. Bilgisayarınızda `backend/.env` dosyasını açın
2. Her satırı kopyalayın
3. Vercel'de **Add New Variable:**
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: `backend/.env` dosyasındaki değer
   - Environments: **Production**, **Preview**, **Development** (hepsini seçin)
   - Save

4. **8 değişken ekleyin** (yukarıdaki tabloda)

5. **Redeploy edin:**
   - Deployments → ⋯ → Redeploy

---

## 5️⃣ Mobile-Backend Bağlantı Testi

### iPhone'da Expo Go Terminal:

Uygulamada hata görüyorsanız:
1. Uygulamayı **sallayın** (shake)
2. **"Debug Remote JS"** veya **"Show Dev Menu"**
3. Hataları görün

### Yaygın Hatalar:

**"Network request failed"** → Backend'e ulaşamıyor
- `mobile/app.json` → `apiUrl` kontrol edin
- `https://aidoctor-ruddy.vercel.app` olmalı

**"401 Unauthorized"** → Firebase Auth çalışmıyor

**"500 Internal Server Error"** → Backend'de hata var (Vercel logs bakın)

---

## 6️⃣ Hızlı Test Adımları

### Adım 1: Backend Test
```
iPhone Safari → https://aidoctor-ruddy.vercel.app/health
```

✅ Çalışıyor → Adım 2'ye geç
❌ Çalışmıyor → Vercel env variables kontrol et

### Adım 2: API Test
```
iPhone Safari → https://aidoctor-ruddy.vercel.app/api
```

✅ `{"message": "AI-Doctor API v1.0"}` gösteriyor → Backend tamam
❌ Hata → Vercel logs kontrol et

### Adım 3: Mobile App
- Expo Go'da uygulamayı aç
- Giriş yapmayı dene
- Console'da hata var mı bak

---

## 🆘 Hala Çalışmıyor mu?

### Vercel Logs'lardan Screenshot Gönderin:

1. Vercel → Deployments → Functions → Logs
2. Screenshot alın
3. Bana gönderin

### Mobile App Hataları:

Expo Go'da:
1. Uygulamayı sallayın
2. "Toggle Element Inspector" veya "Show Performance Monitor"
3. Hata mesajını bana gönderin

---

## 🎯 Muhtemelen Sorun:

**%80 ihtimal:** Vercel'de `FIREBASE_SERVICE_ACCOUNT` veya `OPENAI_API_KEY` eksik/yanlış

**%15 ihtimal:** Vercel'de redeploy yapılmadı (env değişken değişikliklerinden sonra)

**%5 ihtimal:** Mobile app `apiUrl` yanlış

---

**İlk yapmanız gereken:** Vercel'de environment variables'ları kontrol edin!
