# PROJECT_CONTEXT

Son guncelleme: 2026-04-21

## 1) Projenin Amaci ve Ozeti

Bu proje, kullanicinin temel vucut bilgilerine gore guvenli ve uygulanabilir bir kilo hedef plani olusturan bir web uygulamasidir.

Uygulama neler yapiyor:
- Kullanici onboarding (3 adim) ile profil bilgilerini toplar.
- BMR ve TDEE hesaplar.
- Hedef kiloya, hedef tarihe ve guvenli sinirlara gore gunluk kalori onerisi uretir.
- Kullaniciya "onerilen plan" ve "manuel plan" secenegi sunar.
- Dashboard ekraninda gunluk kalori ilerlemesi, hedef durumu ve (opsiyonel) dongu takibi ozeti gosterir.

Hedef kitle:
- Kilo yonetimi icin basit bir planlama araci isteyen son kullanicilar.
- Teknik olmayan kullanicilar (UI aciklayici ve yonlendirici tasarlanmis).

Not:
- Uygulama medikal tani/tedavi araci degildir; yasam tarzi planlama yardimcisidir.

## 2) Teknoloji Yigini (Tech Stack)

Ana diller ve framework:
- TypeScript (~6.0.2)
- React (19.2.4)
- React DOM (19.2.4)
- Vite (8.0.4)

State ve veri:
- Zustand (5.0.12)
- Zustand persist middleware (localStorage)

Stil ve build:
- Tailwind CSS (4.2.2)
- PostCSS (8.5.10)
- Autoprefixer (10.5.0)
- @tailwindcss/postcss (4.2.2)

Kod kalitesi:
- ESLint (9.39.4)
- @eslint/js (9.39.4)
- typescript-eslint (8.58.0)
- eslint-plugin-react-hooks (7.0.1)
- eslint-plugin-react-refresh (0.5.2)

TS config ozeti:
- strict: true
- moduleResolution: bundler
- jsx: react-jsx
- noEmit: true
- noUnusedLocals/noUnusedParameters aktif

Scriptler:
- npm run dev
- npm run build
- npm run lint
- npm run preview

## 3) Klasor Yapisi (Aciklamali)

Kok:
- package.json: scriptler ve bagimliliklar
- vite.config.ts: Vite + React plugin
- tailwind.config.js: Tailwind content tarama ayari
- postcss.config.js: Tailwind + autoprefixer zinciri
- eslint.config.js: lint kurallari
- tsconfig*.json: TS derleme/lint ayarlari
- index.html: SPA giris noktasi (root + main.tsx)

src:
- main.tsx: React root render ve StrictMode
- App.tsx: basit ekran secici; stats+goal varsa Dashboard, yoksa Onboarding
- index.css: Tailwind import
- App.css: su an aktif UI tarafinda belirgin kullanim yok (legacy/yardimci stiller)

src/types:
- index.ts: UserStats, UserGoal, DailyLog veri tipleri

src/store:
- useUserStore.ts:
  - global state: stats, goal, logs, language
  - actionlar: setStats, setGoal, setLanguage, addLog, updateLog, clearAll
  - persist key: vitalstrack-user-store
  - useDailyCalorieTarget helper hook: aktif profile gore intake/uyari hesaplar

src/utils:
- healthEngine.ts:
  - calculateBMR
  - calculateTDEE
  - calculateDailyCalorieDelta
  - calculateIntakeFromDays
  - calculateMinDaysForSafety
  - validateIntake

src/views:
- Onboarding.tsx:
  - 3 adimli wizard (profil -> metabolizma raporu -> hedef/plani sec)
  - dil secimi (tr/en)
  - tema onizleme
  - kadin kullanici icin opsiyonel dongu takibi alanlari
  - onerilen plan ve manuel plan secimi
- Dashboard.tsx:
  - gunluk kalori ilerlemesi (progress ring)
  - mevcut kilo / hedef kilo / kalan gun
  - opsiyonel dongu gunu gosterimi
  - clearAll ile veriyi sifirlama

assets/public:
- src/assets: lokal gorseller (hero, react, vite)
- public: favicon ve ikonlar

## 4) Veri Modeli ve State Yonetimi

Veritabani:
- Harici DB yok.
- Tum kalici veri tarayici localStorage uzerinde tutuluyor.

Global state (Zustand):
- stats: UserStats | null
- goal: UserGoal | null
- logs: DailyLog[]
- language: tr | en

Tip detaylari:
- UserStats:
  - name?, age, height, currentWeight, gender, activityLevel, TDEE
  - cycleTrackingEnabled?, lastPeriodStartDate?, averageCycleLength?
- UserGoal:
  - targetWeight, targetDate, weeklySportQuota
- DailyLog:
  - date, calories, isSportDone, water?, sleep?

Persist davranisi:
- Store persist middleware ile vitalstrack-user-store key inde saklaniyor.
- Sayfa yenilemede profil/hedef/log bilgileri korunuyor.

## 5) Kritik Fonksiyonlar ve Akislar

A) Uygulama acilis akisi:
1. App.tsx store dan stats ve goal okur.
2. Ikisi de varsa Dashboard render eder.
3. Eksikse Onboarding render eder.

B) Onboarding akisi (3 adim):
1. Temel bilgiler:
   - ad, yas, cinsiyet, boy, kilo, aktivite seviyesi
   - kadin + opsiyonel dongu verileri
2. Metabolizma raporu:
   - BMR/TDEE hesaplari
   - ideal kilo ve guvenli kalori anlatimi
3. Plan secimi:
   - Onerilen plan (ideal hedef)
   - Manuel plan (hedef kilo + hedef ay)
   - Kayitla -> store a stats+goal yazilir

C) Hesaplama motoru:
- BMR: Mifflin-St Jeor
- TDEE: BMR * aktivite katsayisi
- Kilo farki -> toplam enerji degisimi: 7700 kcal/kg
- Guvenlik mantigi:
  - BMR altina inen alimi warning ile isaretler
  - hedefe guvenli ulasmak icin min gun hesabini yapar

D) Dashboard akisi:
- Gunun tarihine gore logs filtrelenir.
- Gunluk toplam kalori toplanir.
- Hedef kaloriye gore progress % hesaplanir.
- Hedef tarihe kalan gun sayisi hesaplanir.
- Dongu takibi aktifse dongu gunu hesaplanir.

## 6) Gelistirme Kurallari (Bu repoda izlenen pratikler)

Mevcut koddan cikan kurallar:
- React tarafinda functional component + hooks kullaniliyor.
- TypeScript strict mod acik; tip guvenligi korunmali.
- UI agirlikli olarak Tailwind utility siniflari ile yaziliyor.
- Global state icin Zustand kullaniliyor; yeni global alanlar store uzerinden eklenmeli.
- Hesaplama mantigi gorunumden ayri tutuluyor (utils/healthEngine.ts).
- Veri modelleri merkezi tip dosyasinda (src/types/index.ts) tutuluyor.
- Dosya adlandirma:
  - component: PascalCase (Onboarding.tsx, Dashboard.tsx)
  - store/hook: camelCase (useUserStore.ts)
  - utility: camelCase (healthEngine.ts)
- Persist edilen yapilar degisecekse backward compatibility dusunulmeli.

Onerilen ek kurallar (tutarlilik icin):
- Hesaplama fonksiyonlari icin unit test ekle (ozellikle saglik sinirlari).
- useDailyCalorieTarget ve tarih hesaplari icin edge-case testleri yaz.
- Onboarding icindeki saf helperlari ayri utils dosyasina tasi (dosya buyuklugu azalsin).

## 7) Mevcut Durum ve Sonraki Adim

Mevcut durum:
- MVP seviyesinde calisan bir onboarding + dashboard akisi var.
- Kullanici profili/hedefi persist ediliyor.
- Temel kalori hesaplari ve guvenlik uyarisi mevcut.
- Gunluk log toplama state seviyesinde var; ancak UI uzerinden log ekleme/duzenleme akisi henuz sinirli.

Bir sonraki dogal adimlar:
1. Dashboard a gunluk log giris formu eklemek (kalori, su, uyku, spor).
2. Log gecmisi ve trend gorunumu (haftalik/aylik grafik).
3. Hesaplama motoru ve tarih fonksiyonlari icin test altyapisi kurmak.
4. Onboarding dosyasini modulerlestirmek (adim bile senleri + ortak form alanlari).
5. i18n yapisini merkezi hale getirmek (sabit metinleri sozluk dosyasina tasimak).

## 8) Yeni Chat Icin Kisa Hatirlatma

Yeni bir sohbette hizli baslamak icin:
- Once bu dosyayi oku: PROJECT_CONTEXT.md
- Sonra ilgili gorevde degisiklik yapilacak dosyalari hedefle.
- Hesaplama degisikliginde healthEngine ve useUserStore etkisini birlikte kontrol et.
