# 📱 Expo Publish - iPhone'da Test İçin

## ✅ Backend Hazır!
- Backend URL: https://aidoctor-ruddy.vercel.app ✅
- mobile/app.json güncellendi ✅
- GitHub'a push edildi ✅

## 📲 Şimdi Ne Yapmalısınız?

### Seçenek 1: Bilgisayardan Publish (Önerilen - 5 dakika)

**Expo publish işlemi bilgisayardan yapılmalı!**

1. **Bilgisayarınıza geçin**

2. **Kodu çekin:**
   ```bash
   cd Aidoctor
   git pull origin claude/migrate-from-replit-011CUL9Mbzwh48zwPVtSZ8kW
   ```

3. **Mobile dizinine gidin:**
   ```bash
   cd mobile
   ```

4. **Expo'ya login olun (ilk defa yapıyorsanız):**
   ```bash
   npx expo login
   ```
   - Kullanıcı adı: expo hesabınız
   - Şifre: expo şifreniz

   **Hesabınız yoksa:**
   ```bash
   npx expo register
   ```

5. **Publish edin:**
   ```bash
   npx expo publish
   ```

6. **QR kodu kaydedin veya linki kopyalayın**

7. **iPhone'da Expo Go ile açın:**
   - App Store → Expo Go indirin
   - QR kodu tarayın VEYA
   - Link'e tıklayın: `exp://exp.host/@srgnunlu/aidoctor-app`

---

### Seçenek 2: GitHub Codespaces'ten Publish (Bilgisayarsız)

Eğer bilgisayara erişiminiz yoksa:

1. **GitHub'da projenize gidin:**
   - https://github.com/srgnunlu/Aidoctor

2. **Codespace başlatın:**
   - Yeşil **"Code"** butonu → **"Codespaces"** sekmesi
   - **"Create codespace on ..."** tıklayın
   - 2 dakika bekleyin (VS Code browser'da açılacak)

3. **Terminal'de:**
   ```bash
   cd mobile
   npx expo login
   # Kullanıcı adı ve şifrenizi girin
   npx expo publish
   ```

4. **QR kodu veya linki iPhone'dan açın**

---

### Seçenek 3: Tunnel Modu (Test için - kalıcı değil)

Sadece şu an test etmek istiyorsanız:

**Bilgisayarda:**
```bash
cd mobile
npm run tunnel
```

QR kodu iPhone'dan tarayın. Ancak bu geçici - bilgisayar kapanınca çalışmaz.

---

## 🎯 Sonuç

**Expo publish** yaptıktan sonra:
- ✅ iPhone'da istediğiniz zaman açabilirsiniz
- ✅ Bilgisayar olmadan çalışır
- ✅ Backend Vercel'de 7/24 hazır
- ✅ Gerçek bir uygulamayı test eder gibi kullanırsınız

---

## ❓ Expo Hesabı Nasıl Açılır?

1. [expo.dev](https://expo.dev) → Sign Up
2. Email ve şifre ile kayıt olun
3. app.json'daki `"owner": "srgnunlu"` sizin Expo kullanıcı adınız olmalı

**Veya doğrudan terminal'den:**
```bash
npx expo register
```

---

## 📞 Yardım

- Expo Docs: https://docs.expo.dev/workflow/publishing/
- `npx expo publish --help`

---

**Sonraki adım:** Bilgisayara geçip `npx expo publish` çalıştırın, 2 dakika sonra iPhone'da hazır! 🎉
