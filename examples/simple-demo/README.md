# Push Notification Admin Paneli

Modern bir push notification yönetim sistemi. Next.js 15 ve React 19 kullanarak web tarayıcıları ve PWA'lara bildirim gönderebilir.

## 🚀 Özellikler

- ✅ **Admin Panel**: Kolay kullanımlı bildirim gönderme arayüzü
- ✅ **PWA Desteği**: Web uygulaması olarak yüklenebilir  
- ✅ **Service Worker**: Offline çalışma ve push notification desteği
- ✅ **PostgreSQL**: Güvenilir veritabanı desteği
- ✅ **Next.js 15**: Modern React 19 ve Server Actions yaklaşımı
- ✅ **TypeScript**: Tip güvenliği ile geliştirme
- ✅ **Tailwind CSS**: Modern ve responsive tasarım
- ✅ **Next-Push**: Kolay push notification entegrasyonu
- ✅ **Real-time Updates**: Anlık abonelik yönetimi

## 📦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
# npm kullanarak
npm install

# veya bun kullanarak (önerilen)
bun install
```

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```env
# Database (PostgreSQL veya Neon)
POSTGRES_URL=postgresql://username:password@localhost:5432/database_name

# VAPID Keys (next-push tarafından otomatik oluşturulur)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Veritabanı Kurulumu

PostgreSQL veritabanınızı oluşturun ve schema'yı yükleyin:

```bash
# Local PostgreSQL
psql -d your_database_name -f database/schema.sql

# Veya Neon kullanıyorsanız
# Web arayüzünden schema.sql içeriğini çalıştırın
```

### 4. VAPID Anahtarları

Next-push otomatik olarak VAPID anahtarlarını yönetir. Manuel oluşturmak isterseniz:

```bash
npx web-push generate-vapid-keys
```

### 5. Geliştirme Sunucusunu Başlat

```bash
# npm kullanarak
npm run dev

# veya bun kullanarak
bun dev
```

Uygulama `http://localhost:9214` adresinde çalışacaktır.

## 🎯 Kullanım

### Admin Panel Erişimi

1. Tarayıcınızda `http://localhost:9214` adresine gidin
2. "Subscribe to Notifications" butonuna tıklayın
3. Tarayıcı bildirim izni isteyecek, "İzin Ver"i seçin
4. Artık abonelik oluşturuldu ve bildirim gönderebilirsiniz!

### Bildirim Gönderme

Admin panelinden:
1. **Başlık**: Bildirim başlığını girin
2. **Mesaj**: Bildirim içeriğini girin  
3. **URL** (opsiyonel): Bildirime tıklandığında açılacak sayfa
4. "Send Notification" butonuna tıklayın

### Abonelik Yönetimi

- **Subscriber List**: Tüm aktif aboneleri görüntüler
- **Unsubscribe**: Bildirimleri durdurmak için
- **Real-time Updates**: Abonelik durumu anlık güncellenir

## PWA Özellikleri

### Yükleme

1. Chrome/Edge'de adres çubuğunun yanındaki "Yükle" butonuna tıklayın
2. Veya "Ana Ekrana Ekle" seçeneğini kullanın

### Offline Çalışma

- Service Worker sayesinde offline çalışabilir
- Cache stratejisi ile hızlı yükleme
- Background sync desteği

## 🛠️ Teknik Detaylar

### Teknoloji Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Server Actions (Next.js App Router)
- **Database**: PostgreSQL + postgres.js driver
- **Push Notifications**: next-push + web-push
- **PWA**: Service Worker + Web App Manifest
- **Development**: Turbopack (dev mode)

### Dosya Yapısı

```
src/
├── app/
│   ├── actions.ts              # Server Actions (push notifications)
│   ├── layout.tsx              # Root Layout + PWA setup
│   ├── page.tsx                # Admin Panel UI
│   ├── globals.css             # Tailwind + global styles
│   ├── manifest.ts             # PWA Manifest
│   └── api/
│       └── send-notification/
│           └── route.ts        # API endpoint
public/
├── sw.js                       # Service Worker
├── *.png                       # PWA icons
└── *.svg                       # Static assets
database/
└── schema.sql                  # PostgreSQL schema
```

### Veritabanı Şeması

```sql
-- Subscriptions tablosu
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    expiration_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Push Notification Flow

1. **Client**: next-push hook ile subscription oluştur
2. **Server Action**: Subscription'ı veritabanına kaydet
3. **Admin Panel**: Tüm subscribers'a bildirim gönder
4. **Service Worker**: Push event'i yakala ve göster

## 🚀 Production Deployment

### Vercel (Önerilen)

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com)'de yeni proje oluşturun
3. Environment variables'ları ayarlayın
4. Otomatik deploy

### Environment Variables (Production)

```env
# Neon Database (önerilen)
POSTGRES_URL=postgresql://user:pass@host/db?sslmode=require

# VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

### Diğer Platformlar

- **Netlify**: Static export desteği
- **Railway**: PostgreSQL + Node.js hosting
- **PlanetScale**: MySQL alternatifi
- **Supabase**: PostgreSQL + Auth

### SSL/HTTPS Gereksinimleri

Push notifications HTTPS gerektirir:
- Vercel: Otomatik SSL
- Custom domain: Let's Encrypt kullanın
- Development: localhost üzerinde çalışır

## 🐛 Sorun Giderme

### Push Notifications Çalışmıyor

**Kontrol Listesi:**
- [ ] HTTPS kullanıyor musunuz? (localhost geliştirmede çalışır)
- [ ] Tarayıcı bildirimlere izin veriyor mu?
- [ ] VAPID anahtarları doğru mu?
- [ ] Service Worker yüklendi mi? (DevTools > Application > Service Workers)
- [ ] Subscription veritabanına kaydedildi mi?

**Console Hatalarını Kontrol Edin:**
```bash
# Browser DevTools
F12 > Console > Application

# Service Worker hatalarını görmek için
chrome://serviceworker-internals/
```

### Veritabanı Bağlantı Hatası

```bash
# Bağlantıyı test edin
node -e "const postgres = require('postgres'); const sql = postgres(process.env.POSTGRES_URL); sql\`SELECT 1\`.then(console.log)"

# Environment variables'ları kontrol edin
echo $POSTGRES_URL
```

### Development Sorunları

```bash
# Cache'i temizleyin
rm -rf .next
bun dev

# Dependencies'i yeniden yükleyin
rm -rf node_modules bun.lockb
bun install

# Port çakışması
lsof -ti:9214 | xargs kill -9
```

### PWA Yükleme Sorunları

- Manifest dosyası var mı? `/manifest.json`
- HTTPS kullanıyor musunuz?
- Service Worker aktif mi?
- İkon dosyaları mevcut mu?

## 🔧 Geliştirme

### Scripts

```bash
# Development server (Turbopack ile)
bun dev               # Port 9214'te başlar

# Production build
bun run build
bun start

# Linting
bun run lint

# Type checking
npx tsc --noEmit
```

### Kod Yapısı

**Server Actions (`actions.ts`):**
- `subscribe()`: Yeni subscription kaydet
- `subscribers()`: Tüm aboneleri getir  
- `unsubscribe()`: Aboneliği iptal et

**Client Components (`page.tsx`):**
- `useNextPush` hook kullanımı
- Real-time subscriber management
- Push notification UI

### Environment Variables

```env
# Required
POSTGRES_URL=postgresql://...

# Auto-generated by next-push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Optional
NEXT_PUBLIC_APP_NAME="Push Notifications"
```

### Database Migrations

Schema değişiklikleri için:

```sql
-- Yeni alan eklemek
ALTER TABLE subscriptions ADD COLUMN user_agent TEXT;

-- Index oluşturmak  
CREATE INDEX idx_subscriptions_user_agent ON subscriptions(user_agent);
```
