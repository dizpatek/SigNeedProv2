# <p align="center"><img src="./public/logo.png" alt="SigNeed Hero" width="600" /><br>SigNeed - E-İmza Belge Yönetim Sistemi</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.3.1-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

---

## 🌟 Proje Hakkında

**SigNeed**, işletmeler ve bireyler için PDF belgelerini güvenli bir şekilde yönetmeyi ve elektronik olarak imzalamayı kolaylaştıran modern bir **Belge Yönetim Sistemi (DMS)** çözümüdür. Kağıt süreçlerini dijitale taşıyarak zaman tasarrufu ve operasyonel verimlilik sağlar.

> [!TIP]
> **SigNeed** ile belgelerinizi sadece birkaç saniye içinde yükleyebilir, imzalayabilir ve arşivleyebilirsiniz.

---

## 📑 İçindekiler

- [Demo & Görseller](#-demo--görseller)
- [Temel Özellikler](#-temel-özellikler)
- [Teknoloji Stack](#️-teknoloji-stack)
- [Başlarken](#-başlarken)
  - [Gereksinimler](#gereksinimler)
  - [Kurulum Adımları](#kurulum-adımları)
- [Proje Yapısı](#-proje-yapısı)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [API & Sunucu Eylemleri](#-api--sunucu-eylemleri)
- [Geliştirme Rehberi](#-geliştirme-rehberi)
- [Sorun Giderme](#-sorun-giderme)
- [Gelecek Planları](#-gelecek-planları)

---

## 🎬 Demo & Görseller

| Ana Dashboard | İmza Alanı |
| :---: | :---: |
| ![Dashboard](./docs/screenshots/dashboard.png) | ![Signing](./docs/screenshots/signature.png) |

---

## ✨ Temel Özellikler

- 📁 **Akıllı Belge Yönetimi**: PDF dosyalarını sürükle-bırak yöntemiyle hızlıca yükleyin.
- ✍️ **Gelişmiş E-İmza**: Canvas tabanlı, pürüzsüz imza deneyimi ve hassas yerleştirme.
- � **Anlık Arama**: Binlerce belge arasından saniyeler içinde arama yapın.
- � **Durum İzleme**: Belgelerinizin hangi aşamada (Bekliyor, İmzalandı) olduğunu takip edin.
- � **Güvenli İndirme**: İmzalanmış dökümanları orijinal kalitede indirin.
- 📱 **Tam Mobil Uyumluluk**: Tablet veya telefondan döküman imzalama kolaylığı.
- �️ **Veri Güvenliği**: Prisma ve PostgreSQL ile güvenli veri depolama.

---

## 🛠️ Teknoloji Stack

### Frontend & Framework
- **Next.js 16 (App Router)**: En yeni nesil React framework.
- **React 19**: Modern bileşen mimarisi ve hooks.
- **Tailwind CSS 4**: Modern, hızlı ve özelleştirilebilir tasarım sistemi.
- **Lucide React**: Tutarlı ve şık ikon kütüphanesi.

### Backend & Database
- **TypeScript**: Tam tip güvenliği ve geliştirici deneyimi.
- **Prisma ORM**: Güçlü ve esnek veritabanı erişimi.
- **PostgreSQL**: Endüstri standardı ilişkisel veritabanı.

### PDF İşleme
- **pdf-lib**: Sunucu taraflı PDF modifikasyonu ve imza ekleme.
- **react-pdf-viewer**: Yüksek performanslı PDF görüntüleme.
- **react-signature-canvas**: Hassas çizim ve imza toplama.

---

## 🚀 Başlarken

### Gereksinimler
- **Node.js**: v20.0.0 veya üzeri
- **PostgreSQL**: v14+ veya cloud tabanlı bir veritabanı (Neon, Railway vb.)

### Kurulum Adımları

1. **Depoyu Klonlayın**:
   ```bash
   git clone https://github.com/kullanici/SigNeed.git
   cd SigNeed
   ```

2. **Bağımlılıkları Yükleyin**:
   ```bash
   npm install
   ```

3. **Ortam Değişkenlerini Ayarlayın**:
   `.env` dosyası oluşturun ve veritabanı bağlantınızı ekleyin:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/signeed_db"
   ```

4. **Veritabanını Yapılandırın**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Uygulamayı Başlatın**:
   ```bash
   npm run dev
   ```

---

## 📁 Proje Yapısı

```bash
SigNeed/
├── src/
│   ├── app/                 # Next.js App Router sayfaları
│   │   ├── actions/         # Veritabanı Server Action'ları
│   │   ├── sign/            # Belge imzalama akışları
│   │   └── page.tsx         # Dashboard / Ana Liste
│   ├── components/          # Paylaşılan UI bileşenleri
│   │   ├── ui/              # Temel UI elementleri (Button, Input vb.)
│   │   └── SignaturePad.tsx # İmza çizim bileşeni
│   ├── lib/                 # Prisma ve genel utility dosyaları
│   └── types/               # TypeScript tip tanımlamaları
├── prisma/                  # Veritabanı şeması ve migration'lar
├── public/                  # Statik görseller ve logolar
└── package.json             # Bağımlılıklar ve scriptler
```

---

## 💾 Veritabanı Şeması

Projenin kalbinde yer alan `Document` modeli:

```prisma
model Document {
  id             String    @id @default(cuid())
  name           String    // Belge ismi
  originalUrl    String    // Orijinal PDF yolu
  signedUrl      String?   // İmzalanmış PDF yolu
  status         DocStatus @default(PENDING)
  signatureZones Json      // İmza alanlarının koordinatları
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  isDeleted      Boolean   @default(false)
}

enum DocStatus {
  PENDING
  SIGNED
}
```

---

## � Geliştirme Komutları

| Komut | Açıklama |
| :--- | :--- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim için optimizasyonlu paket oluşturur |
| `npx prisma studio` | Veritabanını görsel olarak yönetmeyi sağlar |
| `npx prisma migrate dev` | Yeni veritabanı değişikliklerini uygular |

---

## ❓ Sorun Giderme

### 1. Veritabanı Bağlantı Hatası
`DATABASE_URL`'in doğruluğundan ve PostgreSQL servisinin çalıştığından emin olun.

### 2. PDF Yükleme Sorunları
`public/uploads` klasörünün (veya kullandığınız depolama servisinin) yazma izinlerini kontrol edin.

### 3. Prisma Generate Hatası
Bağımlılıklar yüklendikten sonra `npx prisma generate` komutunu çalıştırmayı unutmayın.

---

## 🔮 Gelecek Planları

- [ ] **E-Posta Bildirimleri**: İmza bekleyen belgeler için bildirim gönderimi.
- [ ] **Çoklu İmza**: Aynı belge üzerinde birden fazla kişinin imza atabilmesi.
- [ ] **Auth Sistemi**: Kullanıcı bazlı yetkilendirme ve profil yönetimi.
- [ ] **AI Destekli Özet**: Belge içeriklerini yapay zeka ile özetleme.

---

**SigNeed** ile kağıt israfına son verin, işlerinizi hızlandırın. 🚀

---
<p align="center">Made with ❤️ by SigNeed Team</p>
