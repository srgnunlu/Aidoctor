# AI-Doctor Geliştirme Kılavuzu - AI Kodlama Ajanı İçin

## 📚 Dokümanlar ve Kullanım Sırası

Bu klasörde AI-Doctor projesini geliştirmek için ihtiyacınız olan tüm dokümanlar bulunmaktadır. Aşağıdaki sırayı takip ederek AI kodlama ajanınıza (örn: Cursor, Windsurf, Bolt.new, v0.dev) gönderin.

---

## 🗂️ Dosya Listesi

### 📋 Temel Dokümanlar (İLK ÖNCE BUNLARI OKUTUN)

1. **PROJECT_SPECS.md** ⭐
   - Projenin genel bakışı
   - Teknoloji stack
   - Veri modelleri
   - API endpoint listesi
   - Mimari yapı
   - **İLK PROMPT İLE BİRLİKTE YÜKLE**

2. **RULES.md** ⭐
   - Kod kalitesi kuralları
   - Güvenlik gereksinimleri
   - Best practices
   - Hata yapmaması için kritik kurallar
   - **İLK PROMPT İLE BİRLİKTE YÜKLE**

---

### 🔢 Aşamalı Geliştirme Promptları (SIRAYLA GÖNDERİN)

#### **PROMPT_01_Setup.md**
- **Zaman:** 15-20 dakika
- **Ne yapıyor:** Proje altyapısı, klasör yapısı, temel Express app
- **Test:** `npm run dev` ile server çalışmalı, `/health` endpoint yanıt vermeli

#### **PROMPT_02_Authentication.md**
- **Zaman:** 20-30 dakika
- **Ne yapıyor:** Register, login, JWT authentication sistemi
- **Test:** Kullanıcı kaydı ve girişi çalışmalı, token üretmeli

#### **PROMPT_03_Database.md**
- **Zaman:** 30-40 dakika
- **Ne yapıyor:** PostgreSQL bağlantısı, Prisma schema, migrations
- **Test:** Database'e veri yazılmalı, Prisma Studio çalışmalı

#### **PROMPTS_04-10_Summary.md**
- Geriye kalan 7 promptun özeti
- Her birini ayrı ayrı AI'ya gönderin:
  - Prompt 4: Patient CRUD API (20-30 dk)
  - Prompt 5: Vital Signs & History API (20-30 dk)
  - Prompt 6: Lab & Imaging API (20-30 dk)
  - Prompt 7: React Native Setup & Auth (40-60 dk)
  - Prompt 8: Patient List Screen (30-40 dk)
  - Prompt 9: Patient Detail Screens (60-90 dk)
  - Prompt 10: AI Integration & Chat (40-60 dk)

---

## 🚀 Başlangıç Adımları

### 1. AI Ajanınıza İlk Promptu Gönderin

```
Merhaba! AI-Doctor adında bir acil tıp hasta takip sistemi geliştireceğiz. 
Önce iki temel dokümanı oku:

1. PROJECT_SPECS.md - Projenin tüm teknik detayları
2. RULES.md - Kod yazarken uyulması gereken kurallar

Bu iki dosyayı okuduktan sonra, PROMPT_01_Setup.md dosyasındaki 
talimatları takip ederek projenin temel altyapısını kur.

Hazır olduğunda "Prompt 1 tamamlandı" de.
```

**Not:** PROJECT_SPECS.md ve RULES.md dosyalarını AI ajanınızın context'ine yükleyin.

---

### 2. Her Prompt İçin Aynı Yaklaşım

Her prompt dosyasında:
- ✅ **Yapılacaklar listesi** var
- ✅ **Kod örnekleri** var
- ✅ **Test adımları** var
- ✅ **Tamamlanma kriterleri** var

AI ajanınız her promptu tamamladıktan sonra:
1. Testleri yapın
2. Sorun yoksa "Prompt X tamamlandı" deyin
3. Sonraki prompt'a geçin

---

## 📊 Geliştirme Süreci Akış Şeması

```
START
  ↓
[PROJECT_SPECS.md + RULES.md Oku]
  ↓
[PROMPT 1: Setup] → Test → ✅
  ↓
[PROMPT 2: Auth] → Test → ✅
  ↓
[PROMPT 3: Database] → Test → ✅
  ↓
[PROMPT 4: Patient CRUD] → Test → ✅
  ↓
[PROMPT 5: Vitals & History] → Test → ✅
  ↓
[PROMPT 6: Labs & Imaging] → Test → ✅
  ↓
[PROMPT 7: React Native Setup] → Test → ✅
  ↓
[PROMPT 8: Patient List] → Test → ✅
  ↓
[PROMPT 9: Patient Details] → Test → ✅
  ↓
[PROMPT 10: AI & Chat] → Test → ✅
  ↓
END - MVP HAZIR! 🎉
```

---

## ⚠️ Önemli Notlar

### Her Aşamada:
1. **Test etmeyi unutmayın** - Çalışmayan kod üzerine devam etmeyin
2. **Error'ları düzeltin** - Hata varsa önce onu çözün
3. **Git commit yapın** - Her başarılı aşamadan sonra commit
4. **Backup alın** - Önemli aşamalardan sonra kodu yedekleyin

### Yaygın Sorunlar ve Çözümler:

**"Database connection failed"**
→ .env dosyasındaki DATABASE_URL'i kontrol edin

**"Module not found"**
→ `npm install` komutunu çalıştırın

**"Port already in use"**
→ .env dosyasında farklı port kullanın (PORT=5001)

**"Prisma migration failed"**
→ `npx prisma migrate reset` ile sıfırlayın

---

## 🎯 Tahmini Süre

| Aşama | Süre |
|-------|------|
| Prompt 1 | 20 dk |
| Prompt 2 | 30 dk |
| Prompt 3 | 40 dk |
| Prompt 4 | 30 dk |
| Prompt 5 | 30 dk |
| Prompt 6 | 30 dk |
| Prompt 7 | 60 dk |
| Prompt 8 | 40 dk |
| Prompt 9 | 90 dk |
| Prompt 10 | 60 dk |
| **TOPLAM** | **~7-8 saat** |

**Not:** Deneyimli bir developer için süre daha kısa olabilir.

---

## 🛠️ Gerekli Araçlar

### Backend İçin:
- Node.js (v18+)
- PostgreSQL (veya Render/Supabase ücretsiz DB)
- VS Code / Cursor / Windsurf
- Git
- Postman / Thunder Client (API test için)

### Mobile İçin:
- Node.js (v18+)
- Expo CLI
- Android Studio / Xcode (optional)
- Expo Go app (telefonda test için)

---

## 📱 Sonuç

Tüm promptları tamamladığınızda:

✅ Tam çalışan backend API  
✅ PostgreSQL database  
✅ JWT authentication  
✅ Hasta yönetim sistemi  
✅ React Native mobil uygulama  
✅ AI entegrasyonu  
✅ Chat sistemi  

**Bir MVP'niz hazır olacak!** 🚀

---

## 🤝 Destek

Sorun yaşarsanız:
1. İlgili prompt dosyasındaki troubleshooting bölümüne bakın
2. RULES.md dosyasını tekrar okuyun
3. PROJECT_SPECS.md'deki ilgili bölümü kontrol edin

---

## 📧 İletişim

Proje hakkında sorularınız için:
- Email: [sizin email'iniz]
- GitHub: [repository link]

---

**Başarılar! Harika bir uygulama geliştireceğinize inanıyorum! 💪**

---

## 📄 Lisans

Bu proje AI-Doctor için özel olarak geliştirilmiştir.

---

**Son Güncelleme:** 2025-01-18
**Versiyon:** 1.0
