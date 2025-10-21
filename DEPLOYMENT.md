# 📱 iPhone'da Bilgisayarsız Test Etme Rehberi

Bu rehber, AI Doctor uygulamasını iPhone'unuzda bilgisayar olmadan test edebilmeniz için gerekli adımları açıklar.

## 🎯 Amaç

Projeyi her test etmek istediğinizde bilgisayarı açmak zorunda kalmadan, iPhone'unuzdan direkt erişim sağlamak.

## 📋 Gereksinimler

- iPhone'unuzda **Expo Go** uygulaması (App Store'dan ücretsiz)
- Render.com hesabı (ücretsiz)
- GitHub hesabı (zaten var)

---

## 🚀 Adım 1: Backend'i Render.com'a Deploy Etme

### 1.1. Render.com'a Kaydolun

1. [render.com](https://render.com) adresine gidin
2. "Get Started for Free" ile ücretsiz hesap oluşturun
3. GitHub hesabınızla bağlanın

### 1.2. Yeni Web Service Oluşturun

1. Dashboard'da **"New +"** → **"Web Service"** seçin
2. Repository seçimi:
   - `srgnunlu/Aidoctor` repository'sini seçin
   - Branch: `claude/migrate-from-replit-011CUL9Mbzwh48zwPVtSZ8kW`
3. Ayarları yapın:
   ```
   Name: aidoctor-backend
   Region: Frankfurt (en yakın sunucu)
   Branch: claude/migrate-from-replit-011CUL9Mbzwh48zwPVtSZ8kW
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

### 1.3. Environment Variables Ekleyin

"Environment" sekmesinde şu değişkenleri ekleyin:

```bash
NODE_ENV=production
PORT=3001

# Firebase Service Account (tek satırda - backend/.env dosyasından kopyalayın)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}

FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# OpenAI API Key (backend/.env dosyasından kopyalayın)
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE

# Google Cloud API Key (backend/.env dosyasından kopyalayın)
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE

CORS_ORIGIN=*
```

**NOT:** `FIREBASE_SERVICE_ACCOUNT` değerini `backend/.env` dosyasından kopyalayın (tek satır olarak).

### 1.4. Deploy Edin

1. "Create Web Service" butonuna tıklayın
2. Deploy işlemi başlayacak (3-5 dakika)
3. Deploy tamamlandığında size bir URL verilecek:
   ```
   https://aidoctor-backend.onrender.com
   ```

**Bu URL'i not edin!** Mobile app için gerekli.

---

## 📱 Adım 2: Mobile App'i Yapılandırma

### 2.1. Backend URL'ini Güncelleyin

`mobile/app.json` dosyasında:

```json
{
  "expo": {
    ...
    "extra": {
      "apiUrl": "https://aidoctor-backend.onrender.com"
    }
  }
}
```

**Render URL'inizi buraya yazın!**

### 2.2. Expo'ya Publish Edin

Bilgisayarınızda (son kez):

```bash
cd mobile

# Expo'ya login olun (ilk defa yapıyorsanız)
npx expo login

# Uygulamayı publish edin
npx expo publish
```

Bu komut çalıştıktan sonra size bir **QR kod** ve **link** verecek.

---

## 📲 Adım 3: iPhone'da Açma

### 3.1. Expo Go İndirin

App Store'dan **Expo Go** uygulamasını indirin (ücretsiz).

### 3.2. Uygulamayı Açın

**Seçenek 1: QR Kod ile**
1. Expo Go'yu açın
2. "Scan QR Code" seçin
3. Terminal'de gözüken QR'ı tarayın

**Seçenek 2: Link ile**
1. Expo Go'yu açın
2. Terminal'de gözüken linke tıklayın:
   ```
   exp://exp.host/@srgnunlu/aidoctor-app
   ```

### 3.3. Uygulamayı Kullanın

Artık uygulama iPhone'unuzda çalışıyor ve Render'daki backend'e bağlı!

---

## 🔄 Güncellemeler İçin

Kod değişikliği yaptığınızda:

1. **Backend için:**
   - GitHub'a push yapın
   - Render otomatik deploy edecek

2. **Mobile için:**
   - Değişiklikleri yapın
   - `npx expo publish` çalıştırın
   - iPhone'da Expo Go'yu yeniden açın (otomatik güncellenir)

---

## ⚡ Hızlı Test (Bilgisayarsız)

Artık bilgisayar olmadan test edebilirsiniz:

1. iPhone'da **Expo Go**'yu açın
2. "Recently in Development" altında **AI Doctor** görünecek
3. Tıklayın ve kullanmaya başlayın!

---

## 🆘 Sorun Giderme

### Backend'e bağlanamıyorum

1. Render dashboard'da servisinizin **çalışır** durumda olduğunu kontrol edin
2. Logs sekmesinde hata var mı bakın
3. `mobile/app.json` içindeki `apiUrl`'in doğru olduğundan emin olun

### Expo Go "Unable to connect" hatası

1. İnternet bağlantınızı kontrol edin
2. `npx expo publish` komutunu yeniden çalıştırın
3. Expo Go'yu kapatıp açın

### Environment variables hatası

Render'da environment variables'ın hepsinin doğru girildiğini kontrol edin. Özellikle `FIREBASE_SERVICE_ACCOUNT` **tek satır** olmalı.

---

## 💡 İpuçları

- **Ücretsiz Render hesabı**: İlk 15 dakika hareketsizlikten sonra uyur, ilk istek geldiğinde uyanır (30-60 saniye sürer)
- **Expo Go sınırlamaları**: Production'da EAS Build ile native app yapmanız önerilir
- **Backend logları**: Render dashboard → Logs sekmesinden her şeyi görebilirsiniz

---

## 🎉 Tebrikler!

Artık iPhone'unuzda bilgisayar olmadan AI Doctor'u test edebilirsiniz.

**Önemli Linkler:**
- Backend: https://aidoctor-backend.onrender.com (sizin URL'iniz)
- Expo App: exp://exp.host/@srgnunlu/aidoctor-app
- Render Dashboard: https://dashboard.render.com

---

## 📞 Destek

Sorularınız için:
- GitHub Issues: https://github.com/srgnunlu/Aidoctor/issues
- Render Docs: https://render.com/docs
- Expo Docs: https://docs.expo.dev
