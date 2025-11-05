# 🚀 Supabase Migration Guide

Bu döküman Aidoctor projesinin Firebase'den Supabase'e geçişi için adım adım kılavuzdur.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Supabase Projesi Kurulumu](#supabase-projesi-kurulumu)
3. [Database Setup](#database-setup)
4. [Storage Setup](#storage-setup)
5. [Backend Konfigürasyonu](#backend-konfigürasyonu)
6. [Mobile Konfigürasyonu](#mobile-konfigürasyonu)
7. [Vercel Deployment](#vercel-deployment)
8. [Test ve Doğrulama](#test-ve-doğrulama)

---

## 🎯 Genel Bakış

### Değişiklikler

**Firebase → Supabase Migration:**
- **Auth**: Firebase Auth → Supabase Auth
- **Database**: Firestore (NoSQL) → PostgreSQL (Supabase)
- **Storage**: Firebase Storage → Supabase Storage

### Avantajlar

- ✅ PostgreSQL ile güçlü relational database
- ✅ Row Level Security (RLS) ile gelişmiş güvenlik
- ✅ Daha kolay SQL queries
- ✅ Real-time subscriptions
- ✅ Daha uygun fiyatlandırma
- ✅ Open-source

---

## 🔧 Supabase Projesi Kurulumu

### 1. Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. Yeni bir organizasyon oluşturun (ücretsiz)

### 2. Yeni Proje Oluşturma

1. "New Project" butonuna tıklayın
2. Proje bilgilerini girin:
   - **Name**: `aidoctor` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Size en yakın region seçin (örn: `Europe West (London)`)
   - **Pricing Plan**: Free tier ile başlayabilirsiniz

3. "Create new project" butonuna tıklayın
4. Proje oluşturulmasını bekleyin (~2 dakika)

### 3. API Keys'leri Kaydetme

Proje oluşturulduktan sonra:

1. Sol menüden **Settings** → **API** bölümüne gidin
2. Şu bilgileri kaydedin:

```bash
Project URL: https://your-project-ref.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (GİZLİ - paylaşmayın!)
```

---

## 💾 Database Setup

### 1. SQL Editor'ü Açma

1. Sol menüden **SQL Editor** seçeneğine tıklayın
2. "New query" butonuna tıklayın

### 2. Migration Script'ini Çalıştırma

[`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) dosyasının içeriğini SQL Editor'e kopyalayıp çalıştırın.

Bu script şunları oluşturacak:
- ✅ Tüm tabloları (users, patients, vital_signs, lab_results, etc.)
- ✅ Indexleri (performans için)
- ✅ Row Level Security (RLS) policies
- ✅ Triggers (auto-update timestamps)
- ✅ Storage bucket (medical-files)

### 3. Migration'ı Doğrulama

1. Sol menüden **Database** → **Tables** bölümüne gidin
2. Şu tabloların oluşturulduğunu kontrol edin:
   - `users`
   - `patients`
   - `vital_signs`
   - `medical_history`
   - `lab_results`
   - `imaging_results`
   - `chat_messages`
   - `ai_analysis`

---

## 📦 Storage Setup

Storage bucket migration script tarafından otomatik oluşturuldu. Doğrulamak için:

1. Sol menüden **Storage** bölümüne gidin
2. `medical-files` bucket'ının oluşturulduğunu kontrol edin
3. Bucket ayarlarına tıklayıp RLS policies'in aktif olduğunu doğrulayın

---

## 🔨 Backend Konfigürasyonu

### 1. Environment Variables

`backend/.env` dosyası oluşturun (`.env.example`'dan kopyalayın):

```bash
# Environment Configuration
NODE_ENV=development
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# OpenAI API Key
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Google Cloud API Key (for OCR)
GOOGLE_API_KEY=AIza-your-google-cloud-api-key

# CORS Configuration
CORS_ORIGIN=*
```

### 2. API Keys'leri Değiştirme

Supabase Dashboard'dan aldığınız bilgileri `.env` dosyasına ekleyin:

1. `SUPABASE_URL`: Project URL
2. `SUPABASE_ANON_KEY`: anon/public key
3. `SUPABASE_SERVICE_ROLE_KEY`: service_role key

### 3. Dependencies Kurulumu

```bash
cd backend
npm install
```

### 4. Backend'i Test Etme

```bash
npm run dev
```

Backend [`http://localhost:3001`](http://localhost:3001) adresinde çalışacak.

Health check: [`http://localhost:3001/health`](http://localhost:3001/health)

---

## 📱 Mobile Konfigürasyonu

### 1. app.json Güncelleme

[`mobile/app.json`](mobile/app.json) dosyasını açın ve `extra` bölümünü güncelleyin:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3001",
      "supabaseUrl": "https://your-project-ref.supabase.co",
      "supabaseAnonKey": "your-anon-public-key"
    }
  }
}
```

**Production için:**

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend.vercel.app",
      "supabaseUrl": "https://your-project-ref.supabase.co",
      "supabaseAnonKey": "your-anon-public-key"
    }
  }
}
```

### 2. Dependencies Kurulumu

```bash
cd mobile
npm install
```

### 3. Mobile Uygulamayı Başlatma

```bash
# Expo Dev Server
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

---

## ☁️ Vercel Deployment

### 1. Vercel CLI Kurulumu

```bash
npm i -g vercel
```

### 2. Backend Deploy

```bash
cd backend
vercel
```

İlk deploy'da size birkaç soru sorulacak:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: aidoctor-backend (veya istediğiniz isim)
- **Directory**: `./` (Enter)
- **Override settings**: No

### 3. Environment Variables Ekleme

Vercel Dashboard'a gidin ([vercel.com/dashboard](https://vercel.com/dashboard)):

1. Projenizi seçin
2. **Settings** → **Environment Variables** bölümüne gidin
3. Şu değişkenleri ekleyin:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
OPENAI_API_KEY=sk-proj-your-openai-api-key
GOOGLE_API_KEY=AIza-your-google-cloud-api-key
NODE_ENV=production
CORS_ORIGIN=*
```

4. "Save" butonuna tıklayın

### 4. Redeployment

Environment variables ekledikten sonra yeniden deploy edin:

```bash
vercel --prod
```

### 5. Production URL'i Kaydetme

Deploy tamamlandıktan sonra size bir URL verilecek:
```
https://aidoctor-backend-xxx.vercel.app
```

Bu URL'i mobile [`app.json`](mobile/app.json) dosyasındaki `apiUrl` değerine ekleyin.

---

## ✅ Test ve Doğrulama

### 1. Backend API Test

**Health Check:**
```bash
curl https://your-backend.vercel.app/health
```

Yanıt:
```json
{
  "status": "OK",
  "message": "AI-Doctor API is running",
  "timestamp": "2025-11-05T..."
}
```

**Register Test:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test Doctor"
  }'
```

### 2. Supabase Dashboard'dan Doğrulama

1. **Auth** → **Users** bölümüne gidin
2. Test kullanıcısının oluşturulduğunu kontrol edin

3. **Database** → **Table Editor** bölümüne gidin
4. `users` tablosunda yeni kaydın olduğunu kontrol edin

### 3. Mobile App Test

1. Mobile uygulamayı başlatın
2. Register ekranından yeni bir kullanıcı oluşturun
3. Login yapın
4. Patient oluşturun
5. Vital signs, lab results vb. ekleyin

### 4. Logs Kontrolü

**Supabase Logs:**
1. Supabase Dashboard → **Logs** bölümüne gidin
2. Son istekleri ve hataları kontrol edin

**Vercel Logs:**
```bash
vercel logs
```

---

## 🔐 Güvenlik Kontrolleri

### 1. RLS Policies Aktif mi?

```sql
-- SQL Editor'de çalıştırın
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Tüm tablolarda `rowsecurity` değeri `true` olmalı.

### 2. Service Role Key Güvenliği

⚠️ **ÖNEMLİ**: `SUPABASE_SERVICE_ROLE_KEY` asla frontend'de kullanılmamalı!

- ✅ Backend `.env` dosyasında
- ✅ Vercel environment variables'da
- ❌ Mobile app.json'da
- ❌ Git repository'de
- ❌ Public API responses'da

### 3. CORS Ayarları

Production'da CORS'u sıkılaştırın:

```bash
# Vercel Environment Variables
CORS_ORIGIN=https://your-mobile-app-domain.com
```

---

## 📊 Database Schema Özeti

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  phone TEXT,
  role TEXT DEFAULT 'DOCTOR',
  subscription_type TEXT DEFAULT 'FREE',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Patients Table
```sql
patients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  tc_no TEXT UNIQUE,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  admission_date TIMESTAMPTZ,
  complaint TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

Diğer tablolar: `vital_signs`, `medical_history`, `lab_results`, `imaging_results`, `chat_messages`, `ai_analysis`

---

## 🆘 Troubleshooting

### Problem: "SUPABASE_URL is not set"

**Çözüm:**
1. `.env` dosyasının doğru yerde olduğundan emin olun
2. Environment variables'ın doğru yazıldığını kontrol edin
3. Server'ı yeniden başlatın

### Problem: "Failed to fetch user profile"

**Çözüm:**
1. Supabase RLS policies'in aktif olduğunu kontrol edin
2. `handle_new_user` trigger'ının çalıştığını doğrulayın
3. SQL Editor'de şunu çalıştırın:
```sql
SELECT * FROM auth.users;
SELECT * FROM public.users;
```

### Problem: "Storage bucket not found"

**Çözüm:**
1. Supabase Dashboard → Storage bölümüne gidin
2. Migration script'ini tekrar çalıştırın
3. Manuel olarak bucket oluşturun:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-files', 'medical-files', false);
```

### Problem: Vercel deployment hatası

**Çözüm:**
1. `backend/vercel.json` dosyasının doğru olduğunu kontrol edin
2. Environment variables'ın eklendiğini doğrulayın
3. Logs'ları kontrol edin: `vercel logs`

---

## 📚 Ek Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

## 🎉 Tebrikler!

Aidoctor projeniz başarıyla Supabase'e migrate edildi! 

Artık güçlü bir PostgreSQL veritabanı, gelişmiş güvenlik özellikleri ve ölçeklenebilir bir altyapıya sahipsiniz.

**Sonraki Adımlar:**
1. ✅ Production deployment tamamlandı
2. ✅ Mobile app production build
3. ✅ Monitoring ve analytics kurulumu
4. ✅ Backup stratejisi oluşturma

---

**Yardım mı gerekiyor?** 
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Supabase Support: [supabase.com/support](https://supabase.com/support)