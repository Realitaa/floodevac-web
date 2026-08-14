# FloodEvac Web — Sistem Visualisasi Rute Evakuasi Tanggap Banjir

**FloodEvac Web** adalah aplikasi web interaktif berbasis **Laravel + Inertia.js + Vue 3 + Leaflet** yang dirancang untuk memvisualisasikan rute evakuasi tanggap banjir (*Flood-Aware Evacuation Routes*) dan analisis keterjangkauan fasilitas evakuasi di Kota Medan berdasarkan simulasi skenario genangan banjir (**Moderate** dan **Severe**).

Seluruh hasil analisis dan rute evakuasi bersumber dari komputasi ilmiah *Python FloodEvac engine* yang telah divalidasi dan disajikan sebagai artefak web statis performa tinggi tanpa dependensi API tambahan.

---

## 🌟 Fitur Utama

- **Peta Interaktif Evakuasi (Leaflet.js)**: Visualisasi peta penuh berbasis OpenStreetMap yang berpusat di wilayah Kota Medan dengan kontrol zoom dan pan.
- **Titik Awal Evakuasi (*Evacuation Origin*)**: Ditandai secara jelas dengan penanda pin merah (*Red Pin Marker*) khusus di lokasi asal evakuasi yang ditentukan.
- **Overlay Genangan Banjir (Raster Overlay)**: Visualisasi spasial kedalaman genangan banjir untuk skenario simulasi **Moderate** (sedang) dan **Severe** (parah) yang dapat diaktifkan/dinonaktifkan secara *real-time*.
- **1,248 Destinasi Evakuasi Potensial**: Visualisasi lokasi fasilitas evakuasi yang bersumber langsung dari GeoJSON statis (`public/data/destinations.geojson`), dilengkapi status keamanan banjir skenario (`SAFE`, `AT_RISK`, `FLOODED`, `NO_DATA`).
- **Pencarian & Penyaringan Destinasi**:
  - Pencarian nama fasilitas atau ID fasilitas (`fac_XXXX`) secara cepat dan toleran terhadap huruf besar/kecil.
  - Filter berdasarkan status keamanan banjir dan kategori fasilitas (Fasilitas Kesehatan, Tempat Ibadah, Pendidikan, Fasilitas Umum, dll).
- **Rute Evakuasi Tanggap Banjir Per-Destinasi**:
  - Pemilihan destinasi manapun secara interaktif dari peta atau hasil pencarian.
  - Penayangan rute evakuasi prabawa (*precomputed Flood-Aware route*) dari titik asal ke destinasi pilihan.
  - Metrik rute presisi: Jarak (km), Estimasi Waktu Tempuh (menit), dan Panjang Paparan Banjir (meter).
- **Perbandingan Skenario Rute (Moderate vs Severe)**:
  - Mode **Compare Both** membandingkan rute skenario Moderate (garis biru solid) dan Severe (garis merah putus-putus) secara bersamaan pada destinasi yang sama.
  - Analisis perbedaan jarak (`+XX m`), selisih waktu tempuh (`+XX detik`), dan indikasi perubahan jalur atau kehilangan aksesibilitas (*became unreachable*).
- **Arsitektur Tanpa API Server-Side (Static Delivery)**: DataGeoJSON dan indeks rute dimuat secara efisien melalui *lazy-loading* langsung dari folder `public/data/` ke memori peramban (browser caching).

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: [Laravel 12](https://laravel.com/) (PHP 8.5 / 8.2+)
- **Frontend SPA**: [Inertia.js v3](https://inertiajs.com/) + [Vue 3](https://vuejs.org/) (Composition API & `<script setup>`)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/) & PHP
- **Peta & GIS**: [Leaflet.js](https://leafletjs.com/)
- **Desain & Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing & Quality Assurance**: [Pest PHP](https://pestphp.com/), Vue-TSC, ESLint, Prettier, Laravel Pint

---

## 📁 Struktur Artefak Data Statis (`public/data/`)

Aplikasi mengonsumsi artefak data ilmiah yang berada di folder `public/data/`:

```text
public/data/
├── destinations.geojson                # 1,248 titik destinasi evakuasi (WGS84 / EPSG:4326)
├── flood/
│   ├── moderate/
│   │   ├── flood_depth_web.png         # Raster genangan banjir skenario Moderate
│   │   └── flood_depth_web.json        # Batas spasial (leaflet_bounds) & metadata
│   └── severe/
│       ├── flood_depth_web.png         # Raster genangan banjir skenario Severe
│       └── flood_depth_web.json        # Batas spasial (leaflet_bounds) & metadata
└── routes/
    └── destinations/
        ├── moderate.json               # Indeks rute per-destinasi skenario Moderate
        ├── severe.json                 # Indeks rute per-destinasi skenario Severe
        └── comparison.json             # Indeks perbandingan metrik skenario Moderate vs Severe
```

---

## 🚀 Petunjuk Instalasi & Memulai Proyek

### 1. Prasyarat Sistem
Pastikan lingkungan pengembangan Anda telah terpasang:
- **PHP** >= 8.2 (disarankan PHP 8.5)
- **Composer** >= 2.x
- **Node.js** >= 20.x
- **pnpm** (atau npm / yarn)

### 2. Langkah-langkah Penginstalan

1. **Clone repository ini**:
   ```bash
   git clone <repository-url>
   cd floodevac-web
   ```

2. **Install dependensi PHP**:
   ```bash
   composer install
   ```

3. **Install dependensi Node.js / Frontend**:
   ```bash
   pnpm install
   ```

4. **Konfigurasi Lingkungan (`.env`)**:
   Salin file contoh konfigurasi dan generate application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Jalankan Server Pengembang (Development Server)**:
   Anda dapat menjalankan server backend dan bundler frontend sekaligus dengan perintah:
   ```bash
   php artisan dev
   ```
   *Atau jalankan secara terpisah di dua terminal:*
   ```bash
   # Terminal 1: PHP server
   php artisan serve

   # Terminal 2: Vite dev server
   pnpm run dev
   ```

6. **Buka Aplikasi di Peramban**:
   Akses dashboard peta di:
   `http://localhost:8000/floodevac`

---

## 🧪 Pengujian & Penjaminan Mutu (Quality Assurance)

Repository ini dilengkapi dengan pengujian otomatis untuk memvalidasi integritas file data statis dan fungsionalitas aplikasi.

### Jalankan Tes Pest PHP:
```bash
./vendor/bin/pest
```

### Jalankan Pemeriksaan Tipe TypeScript:
```bash
pnpm run types:check
```

### Jalankan Pemeriksaan Format Code & Linting:
```bash
pnpm run format:check
pnpm run lint:check
```

### Build Aset Produksi:
```bash
pnpm run build
```

### Jalankan Seluruh Verifikasi (One-Liner):
```bash
pnpm run build && pnpm run types:check && pnpm run format:check && pnpm run lint:check && ./vendor/bin/pest
```

---

## 🏛️ Catatan Arsitektur & Terminologi Ilmiah

- **Tidak Ada Database / Controller API**: Aplikasi ini tidak menggunakan tabel database atau endpoint API controller Laravel untuk menyajikan rute/destinasi. Seluruh data disajikan secara statis dari folder `public/data/` untuk menjamin kecepatan dan keandalan di lapangan.
- **Terminologi Resmi**:
  - Destinasi dinamakan *"Potential Evacuation Destination"* atau *"Emergency Facility"*. (Bukan *"Official Shelter"* atau *"Guaranteed Shelter"*).
  - Rute dinamakan *"Flood-Aware Route"*.
- **Pemisahan Keamanan vs Keterjangkauan**: Status keamanan lokasi destinasi (*Destination Safety*: `SAFE`, `AT_RISK`, `FLOODED`) dan keterjangkauan jalur rute (*Route Accessibility*: `REACHABLE`, `UNREACHABLE`) ditampilkan secara terpisah dan eksplisit.

---

## 📄 Lisensi

Proyek ini dikembangkan sebagai bagian dari partisipasi lomba GEMASTIK XIX 2026.
