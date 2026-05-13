# MarkForm

MarkForm, kalori, su, egzersiz, kilo ve adet takibini tek bir panelde toplayan, hedef odaklı bir sağlık takip uygulamasıdır. Uygulama; onboarding akışı, günlük takip, akıllı besin ekleme, barkod tarama, kilo grafikleri, adet takvimi ve Supabase senkronizasyonu ile hem yerel hem bulut tabanlı bir deneyim sunar.

## Ekran Görüntüleri

**Giriş ve karşılama**

<img src="src/images/1-giris.png" alt="Giriş ekranı" width="650" />

**Onboarding: kişisel plan ve hedef seçimi**

<img src="src/images/2-ki%C5%9Fisel-plan.png" alt="Kişisel plan ve hedef seçimi" width="650" />

**Ana sayfa: günlük özet ve hızlı ekleme**

<img src="src/images/3-ana-sayfa.png" alt="Ana sayfa ve günlük özet" width="650" />

**Kilo takibi: grafik ve geçmiş**

<img src="src/images/4-kilo-takibi.png" alt="Kilo takibi ve grafik" width="650" />

**Profil: bilgiler, hedef ve güncelleme**

<img src="src/images/5-guncelleme.png" alt="Profil güncelleme paneli" width="650" />

**Adet takvimi: döngü evreleri**

<img src="src/images/6-adet-takvimi.png" alt="Adet takvimi" width="650" />

## Uygulama akışı

- Giriş / Kayıt / Misafir modu ile başlangıç.
- 3 adımlı onboarding ile temel bilgiler, metabolizma raporu ve hedef plan seçimi.
- Dashboard üzerinden günlük kalori, su, egzersiz ve öğün takibi.
- Profil panelinde hedef, kilo geçmişi, adet takvimi ve hesap ayarları.

## Özellikler (Tam Liste)

### Onboarding ve Hedef Planlama

- 3 adımlı onboarding: temel bilgiler, metabolizma raporu, hedef belirleme.
- BMR ve TDEE hesapları (Mifflin-St Jeor).
- İdeal kilo ve güvenli hedef süresi önerisi.
- Önerilen plan ile tek tık seçim veya manuel hedef oluşturma.
- Günlük kalori hedefi ve güvenli limit uyarıları.
- Aktivite düzeyi seçimi (hareketsiz -> aşırı aktif).
- Dil seçimi (TR/EN) onboarding ekranında da bulunur.

### Dashboard ve Günlük Takip

- Günlük özet kartı: kalori halkası, makro dağılımı (protein/karb/yağ) ve kalan kcal.
- Su takibi: günlük hedef ve anlık tüketim.
- Egzersiz durumu ve tahmini yakılan kalori.
- Günün kayıtları: öğün bazlı liste + su kayıtları.
- Su kayıtlarını düzenleme/silme.
- Sonraki 7 gün ve son 30 gün geçmiş görünümü.

### Besin Takibi ve Kütüphane

- Öğüne göre besin ekleme (kahvaltı, öğle, akşam, atıştırmalık).
- Dört farklı ekleme modu:
  - Listeden seçim (kütüphane).
  - Manuel giriş (kcal + makro).
  - Akıllı ekleme (metinden miktar + besin eşleştirme).
  - Barkod tarama (Open Food Facts).
- Barkod taramada fener kontrolü.
- Besin kütüphanesi: ekle, düzenle, sil.
- Başlangıç besin listesi CSV (besin-listesi.csv) ile gelir.

### Su Takibi

- Hazır su miktarları (100/200/400/500/1000 ml).
- Manuel su girişi.
- Günlük hedefe göre durum.

### Egzersiz Takibi

- Hazır egzersiz tipleri (yürüyüş, koşu, güç, bisiklet, kardiyo).
- Manuel egzersiz adı girişi.
- Süre bazlı kalori tahmini.

### Profil ve Sağlık Raporu

- Profil panelinde BMI, TDEE, BMR özetleri.
- Kişisel bilgi ve hedef güncelleme (kilo, boy, yaş, hedef kilo, hedef süre).
- Haftalık spor kotası ve günlük su hedefi.
- Kilo grafiği (son 30 gün / tüm zamanlar).
- Kilo geçmişi ekleme, düzenleme, silme.

### Adet Takibi

- Adet takvimi (adet, foliküler, ovulasyon, luteal).
- Son adet tarihi ve döngü uzunluğuna göre tahmin.
- Dashboard uyarısı: adet tarihi yaklaşırken bildirim.

### Kimlik, Misafir Modu ve Bulut Senkronizasyonu

- E-posta ile kayıt/giriş.
- Google ile giriş.
- Misafir modu (veriler sadece cihazda saklanır).
- Supabase senkronizasyonu (profil + günlük loglar).
- Yerel veriden buluta otomatik geçiş.

### Diğer

- Zustand ile localStorage persist.
- Toast bildirimleri.
- TR/EN dil desteği tüm temel ekranlarda.

## Teknoloji ve Altyapı

- React 19 + TypeScript + Vite
- Zustand (state + persist)
- Tailwind CSS
- Supabase (auth + data sync)
- html5-qrcode (barkod tarama)
- Open Food Facts API (barkod ürün verisi)

## Kurulum

```bash
npm install
npm run dev
```

## Ortam Değişkenleri

Supabase kullanımı için aşağıdaki değişkenler gereklidir:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Build ve Preview

```bash
npm run build
npm run preview
```

## Notlar

- Misafir modunda veriler yalnızca cihazda tutulur.
- Supabase tabloları: profiles, daily_logs.
- Barkod verisi Open Food Facts üzerinden çekilir.
