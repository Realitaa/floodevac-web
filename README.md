# FloodEvac Web — Sistem Visualisasi Rute Evakuasi Tanggap Banjir

**FloodEvac Web** adalah aplikasi web interaktif berbasis **Vue 3 + Vite + Leaflet + Tailwind CSS** yang dirancang untuk memvisualisasikan rute evakuasi tanggap banjir (*Flood-Aware Evacuation Routes*) dan analisis keterjangkauan fasilitas evakuasi di Kota Medan berdasarkan simulasi skenario genangan banjir (**Moderate** dan **Severe**).

Seluruh hasil analisis dan rute evakuasi bersumber dari komputasi ilmiah *Python FloodEvac engine* yang disajikan sebagai artefak web statis performa tinggi tanpa dependensi backend/API server.

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
- **Arsitektur Standalone Single Page Application (Pure Frontend)**: Data GeoJSON dan indeks rute dimuat secara efisien melalui *lazy-loading* langsung dari folder `public/data/` ke memori peramban tanpa memerlukan backend API server atau database.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API & `<script setup>`) + [Vite](https://vite.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Peta & GIS**: [Leaflet.js](https://leafletjs.com/)
- **Desain & Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting & Code Quality**: Vue-TSC, ESLint, Oxlint, Prettier

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

## 🚀 Petunjuk Pengoperasian

### 1. Prasyarat Sistem
- **Node.js** >= 20.x
- **pnpm** (atau npm / yarn)

### 2. Langkah-langkah Penginstalan & Jalankan Server Pengembang

```bash
# 1. Install dependensi
pnpm install

# 2. Jalankan Vite dev server
pnpm run dev
```

Akses aplikasi di browser pada alamat yang ditampilkan Vite (biasanya `http://localhost:5173`).

---

## 🧪 Pengujian & Penjaminan Mutu (Quality Assurance)

```bash
# Jalankan pengujian unit & integritas data statis (Vitest)
pnpm run test:run

# Jalankan pemeriksaan tipe TypeScript
pnpm run type-check

# Build bundel produksi
pnpm run build
```

---

## 🏛️ Catatan Arsitektur & Terminologi Ilmiah

- **100% Client-Side / Tanpa Backend**: Seluruh data disajikan secara statis dari folder `public/data/` untuk menjamin kecepatan, performa tinggi, dan keandalan di lapangan saat koneksi server terganggu.
- **Terminologi Resmi**:
  - Destinasi dinamakan *"Potential Evacuation Destination"* atau *"Emergency Facility"*.
  - Rute dinamakan *"Flood-Aware Route"*.
- **Pemisahan Keamanan vs Keterjangkauan**: Status keamanan lokasi destinasi (*Destination Safety*: `SAFE`, `AT_RISK`, `FLOODED`) dan keterjangkauan jalur rute (*Route Accessibility*: `REACHABLE`, `UNREACHABLE`) ditampilkan secara terpisah dan eksplisit.
