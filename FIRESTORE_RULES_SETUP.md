# 🔐 Firestore Security Rules Kurulumu

## ❌ Sorun: Missing or insufficient permissions

Mobil uygulamada `FirebaseError: Missing or insufficient permissions` hatası alıyorsunuz çünkü **Firestore güvenlik kuralları Firebase Console'da deploy edilmemiş**.

---

## ✅ ÇÖZÜM: Firestore Rules Deployment

### 1️⃣ Firebase Console'a Gidin

1. **Tarayıcıda açın:**
   ```
   https://console.firebase.google.com/project/aidoctor-5e9b2/firestore/rules
   ```

2. **Google hesabınızla giriş yapın** (Firebase projesine erişimi olan hesap)

---

### 2️⃣ Mevcut Kuralları Görün

Şu anda muhtemelen şöyle varsayılan kurallar var:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ HİÇBİR ERİŞİM YOK
    }
  }
}
```

Bu yüzden "Missing permissions" hatası alıyorsunuz!

---

### 3️⃣ Yeni Kuralları Kopyalayın

Aşağıdaki kuralları **TAMAMEN** kopyalayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    match /patients/{patientId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;

      match /vitalSigns/{vitalId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /labResults/{labId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /imagingResults/{imagingId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /medicalHistory/{historyId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /aiAnalyses/{analysisId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /chatMessages/{messageId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /ocrResults/{ocrId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }

      match /fileMetadata/{fileId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/patients/$(patientId)).data.userId == request.auth.uid;
      }
    }
  }
}
```

---

### 4️⃣ Firebase Console'da Yapıştırın

1. Firebase Console'da **"Rules"** sekmesinde olduğunuzdan emin olun
2. Mevcut tüm kuralları **SİLİN** (Ctrl+A → Delete)
3. Yukarıdaki kuralları **YAPIŞTIRIN** (Ctrl+V)
4. **"Publish"** butonuna tıklayın (sağ üst köşede)

**Onay ekranında:**
- ⚠️ "This will overwrite your existing rules" uyarısı çıkacak
- ✅ **"Publish"** butonuna tıklayın

---

### 5️⃣ Kuralların Aktif Olmasını Bekleyin

- **10-30 saniye** bekleyin (kurallar deploy oluyor)
- **"Rules published successfully"** mesajını görmelisiniz ✅

---

### 6️⃣ Mobil Uygulamayı Test Edin

iPhone'unuzda Expo Go'da:

1. **Uygulamayı TAMAMEN KAPATIN** (swipe up → kapat)
2. **Yeniden açın**
3. **Giriş yapın**
4. **Yeni hasta eklemeyi deneyin** → Artık çalışmalı! ✅
5. **AI analiz yapmayı deneyin** → Çalışmalı! ✅

---

## 🔍 Kurallar Doğru mu Kontrol

### Firebase Console'da:

1. **Firestore → Rules** sekmesinde
2. En üstte **"Published"** yazdığını görmelisiniz
3. Tarih son deploy tarihinizi göstermelidir

### Test Query (opsiyonel):

Firebase Console'da **"Rules Playground"** kullanabilirsiniz:

1. **Location:** `/databases/(default)/documents/patients/test123`
2. **Authenticated:** ✅ (seçili)
3. **Provider:** `Custom`
4. **uid:** `test-user-123`
5. **Simulated read:** ✅ **PASS** olmalı (eğer document varsa)

---

## 🆘 Hala "Missing Permissions" Hatası Alıyorsanız

### Kontrol Listesi:

- [ ] Firebase Console'da kuralları publish ettim ✅
- [ ] "Rules published successfully" mesajını gördüm ✅
- [ ] 30 saniye bekledim ✅
- [ ] Mobil uygulamayı tamamen kapattım ve yeniden açtım ✅
- [ ] Yeni kullanıcı ile giriş yaptım (veya logout/login) ✅

### Eğer Hala Çalışmıyorsa:

**Firestore Data Kontrolü:**

1. Firebase Console → **Firestore → Data**
2. **patients** koleksiyonuna gidin
3. Herhangi bir patient document'i açın
4. **`userId` field'ı var mı?** ✅
   - Varsa: Field adı **TAM OLARAK** `userId` olmalı (userID, user_id değil!)
   - Yoksa: Bu field eklenmeli!

**Console Error Detayları:**

Mobil uygulamada:
1. Uygulamayı sallayın (shake)
2. Dev Menu'den **"Debug Remote JS"**
3. **Tam hata mesajını** bana gönderin:
   ```
   FirebaseError: Missing or insufficient permissions
   at ...
   ```

---

## 📋 Özet Checklist

- [ ] Firebase Console'a gittim
- [ ] Rules sekmesini açtım
- [ ] Eski kuralları sildim
- [ ] Yeni kuralları yapıştırdım
- [ ] Publish butonuna tıkladım
- [ ] "Rules published successfully" gördüm
- [ ] 30 saniye bekledim
- [ ] Mobil uygulamayı yeniden başlattım
- [ ] Hasta ekleme çalışıyor! ✅
- [ ] AI analiz çalışıyor! ✅

---

**Sonraki adım:** Firebase Console'a gidin, kuralları publish edin, uygulamayı test edin!

**Firebase Console Direkt Link:**
```
https://console.firebase.google.com/project/aidoctor-5e9b2/firestore/rules
```
