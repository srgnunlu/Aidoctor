# AI Doctor - Acil Tıp Hasta Takip Sistemi

AI destekli acil tıp hasta takip ve yönetim sistemi. Firebase, OpenAI ve Google Cloud Vision teknolojileri kullanılarak geliştirilmiştir.

## Özellikler

- 🔐 Firebase Authentication ile güvenli kullanıcı yönetimi
- 👥 Hasta kayıt ve takip sistemi
- 📊 Vital signs (yaşamsal bulgular) izleme
- 🧪 Laboratuvar sonuçları yönetimi
- 🩻 Görüntüleme sonuçları (radyoloji) takibi
- 📸 OCR ile tıbbi belge tarama (Google Cloud Vision)
- 🤖 AI destekli tanı önerileri (OpenAI GPT)
- 💬 AI Chat asistanı
- 📱 React Native mobil uygulama (iOS/Android)

## Teknoloji Stack

### Backend
- Node.js & Express.js
- Firebase Admin SDK (Firestore & Storage)
- Google Cloud Vision API (OCR)
- OpenAI API (GPT-4)

### Frontend/Mobile
- React Native & Expo
- React Navigation
- Redux Toolkit
- React Native Paper (UI)
- Firebase Client SDK

## Kurulum

### Gereksinimler

- Node.js v18+ ve npm
- Firebase projesi (Firestore & Storage aktif)
- Google Cloud Vision API erişimi
- OpenAI API anahtarı
- Expo Go uygulaması (mobil test için)

### 1. Bağımlılıkları Yükleyin

```bash
# Kök dizinde
npm install

# Backend için
cd backend
npm install

# Mobile için
cd ../mobile
npm install
```

### 2. Environment Variables Ayarlayın

`backend/.env` dosyası zaten oluşturulmuştur. Gerekli değerleri kontrol edin:

```bash
cd backend
cat .env
```

Gerekli environment variables:
- `FIREBASE_SERVICE_ACCOUNT`: Firebase Service Account JSON (tek satırda)
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket adı
- `OPENAI_API_KEY`: OpenAI API anahtarı
- `GOOGLE_API_KEY`: Google Cloud API anahtarı
- `PORT`: Backend port (varsayılan: 3001)

### 3. Firebase Konfigürasyonu

Mobile uygulamada Firebase client konfigürasyonunu ayarlayın:

```bash
# mobile/src/ dizininde Firebase config dosyası oluşturun
# Firebase Console -> Project Settings -> Web App
```

## Projeyi Çalıştırma

### Backend'i Başlatın

```bash
cd backend
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacaktır.

### Mobile Uygulamayı Başlatın

#### Web'de Test (Tarayıcıda)

```bash
cd mobile
npm run web
```

#### iPhone/Android'de Test (Tunnel Modu)

```bash
cd mobile
npm run tunnel
```

QR kodu tarayın ve Expo Go uygulamasıyla açın.

Alternatif olarak:

```bash
npm run ios     # iOS simulator
npm run android # Android emulator
```

### Her İkisini Birlikte Çalıştırma

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd mobile && npm run tunnel
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh` - Token yenileme

### Patients
- `GET /api/patients` - Hasta listesi
- `POST /api/patients` - Yeni hasta ekleme
- `GET /api/patients/:id` - Hasta detayları
- `PUT /api/patients/:id` - Hasta güncelleme

### Vital Signs
- `POST /api/patients/:patientId/vitals` - Vital sign ekleme
- `GET /api/patients/:patientId/vitals` - Vital signs listesi

### Lab Results
- `POST /api/patients/:patientId/labs` - Laboratuvar sonucu ekleme
- `GET /api/patients/:patientId/labs` - Lab sonuçları listesi

### Imaging Results
- `POST /api/patients/:patientId/imaging` - Görüntüleme sonucu ekleme
- `GET /api/patients/:patientId/imaging` - Görüntüleme sonuçları

### OCR
- `POST /api/ocr/patients/:patientId/upload` - Görüntü yükleme ve OCR
- `GET /api/ocr/patients/:patientId/results` - OCR sonuçları

### AI Chat
- `POST /api/chat/patients/:patientId` - AI ile sohbet
- `GET /api/chat/patients/:patientId/history` - Sohbet geçmişi

## Dosya Yapısı

```
Aidoctor/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase ve app konfigürasyonu
│   │   ├── controllers/     # Route controller'ları
│   │   ├── middleware/      # Auth ve error middleware
│   │   ├── routes/          # API route tanımları
│   │   ├── services/        # Business logic (AI, OCR, Storage)
│   │   └── utils/           # Yardımcı fonksiyonlar
│   ├── .env                 # Environment variables (GIT'E PUSH ETMEYIN!)
│   ├── server.js           # Express server
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── components/      # React Native bileşenleri
│   │   ├── screens/         # Uygulama ekranları
│   │   ├── navigation/      # React Navigation
│   │   ├── store/           # Redux store
│   │   └── services/        # API servisleri
│   ├── App.js
│   └── package.json
└── README.md
```

## Güvenlik Notları

- `.env` dosyası asla git'e commit edilmemelidir
- Firebase Service Account anahtarları gizli tutulmalıdır
- OpenAI ve Google API anahtarları güvenli saklanmalıdır
- Production'da environment variables hosting platformunda ayarlanmalıdır

## Replit'ten Migration

Proje Replit'ten GitHub'a taşınmış ve şu değişiklikler yapılmıştır:

- ✅ `@replit/object-storage` → Firebase Storage
- ✅ Replit environment variables → `.env` dosyası
- ✅ `.gitignore` eklendi
- ✅ Tunnel modu için Expo konfigürasyonu düzenlendi

## Lisans

ISC

## İletişim

Sorularınız için issue açabilirsiniz.
