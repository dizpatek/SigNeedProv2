---
description: Projeyi GitHub'a yükleme ve Vercel/Postgres üzerinden yayına alma
---

Bu iş akışı, projenizin canlı ortama taşınması için gerekli adımları içerir.

### 1. Yerel Git Hazırlığı
Projenizi Git ile eşitleyelim.
// turbo
1. Terminalde şu komutları sırayla çalıştırın:
   ```bash
   git init
   git add .
   git commit -m "deploy: initial commit"
   ```

### 2. GitHub Deposu Oluşturma
// turbo
2. Tarayıcıda yeni bir GitHub deposu oluşturun:
   [Yeni GitHub Deposu Oluştur](https://github.com/new)
   * Depo adını `SigNeed` yapın.
   * "Create repository" butonuna basın.

### 3. GitHub'a Gönderme
// turbo
3. GitHub sayfasında size verilen şu komutları (kendi kullanıcı adınızla) terminalde çalıştırın:
   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/SigNeed.git
   git branch -M main
   git push -u origin main
   ```

### 4. Vercel Dağıtımı ve Veritabanı
4. Vercel paneline gidin: [Vercel Dashboard](https://vercel.com/new)
   * `SigNeed` deposunu seçin ve **Import** deyin.
   * **Storage** sekmesine tıklayın ve **Connect Database** diyerek yeni bir **Vercel Postgres** oluşturun.
   * Bu işlem bittiğinde çevre değişkenleri (`DATABASE_URL` vb.) otomatik olarak projenize eklenecektir.

### 5. Canlıyı Kontrol Etme
5. Dağıtım tamamlandığında Vercel size bir URL verecektir. Bu URL üzerinden sisteminizi test edebilirsiniz.
