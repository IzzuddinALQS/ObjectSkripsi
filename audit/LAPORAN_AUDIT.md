# Laporan Audit Kompleksitas Kode — LAB-INDUSTRI

Pengukuran Cyclomatic Complexity (CC) dan Cognitive Complexity (CogC) pada kode apa adanya
(tanpa perubahan kode sumber aplikasi).

## 1. Commit yang diaudit

```
ebd45d8 2026-05-05 08:40:56 +0700
```

Tanggal pengukuran: 2026-10-30.

## 2. Instrumen penelitian (versi persis)

| Alat | Versi |
|---|---|
| Node.js | v24.14.1 |
| npm | 11.11.0 |
| Git | 2.53.0.windows.1 |
| Python (skrip ringkasan) | 3.13.7 |
| eslint | 10.13.0 |
| typescript-eslint | 8.72.1 |
| eslint-plugin-sonarjs | 4.2.2 |
| TypeScript | 6.0.3 |
| SonarQube Community Build | 26.10.0.133078 (`/api/server/version`) |
| SonarScanner CLI | 8.1.0.6389 (image `sonarsource/sonar-scanner-cli`) |
| Docker Engine | 28.3.2 |

Catatan kompatibilitas: eslint-plugin-sonarjs 4.2.2 mendukung eslint `^8 || ^9 || ^10` dan
typescript-eslint 8.72.1 mendukung eslint `^10` serta TypeScript `>=4.8.4 <6.1.0`, sehingga eslint
versi terbaru (10) dipakai, bukan eslint 9.

## 3. Konfigurasi

- ESLint: `audit/eslint.audit.mjs`, rule `complexity` max 0 dan `sonarjs/cognitive-complexity` ambang 0
  (semua fungsi dilaporkan beserta nilainya), berkas `**/*.{ts,tsx}`.
  Perintah (dari root repo):
  `npx --prefix audit eslint --no-config-lookup -c audit/eslint.audit.mjs -f json . > audit/hasil_audit.json`
- SonarQube: `sonar-project.properties` (sources `app,features,lib`). Quality profile
  **"Audit Kompleksitas"** (salinan "Sonar way") untuk TypeScript dan JavaScript, dengan
  S3776 `threshold=0` dan S1541 ambang 0 (`Threshold` untuk TS, `maximumFunctionComplexityThreshold` untuk JS).

## 4. Distribusi risiko CC (ESLint)

Kategori: Low ≤ 10, Moderate 11–20, High 21–50, Very High > 50.

| Kategori | A. app/, features/, lib/ | B. Seluruh repo |
|---|---|---|
| Low | 1594 | 1819 |
| Moderate | 45 | 45 |
| High | 17 | 18 |
| Very High | 0 | 0 |
| **Total fungsi** | **1656** | **1882** |
| **CC > 10** | **62** | **63** |

Hasil ini identik dengan angka acuan untuk commit ebd45d8.

## 5. Berkas yang gagal diurai

| Berkas | Pesan |
|---|---|
| `features/scheduled-practicum/components/ScheduledPracticumManager.tsx` | ESLint: *Parsing error: Expected corresponding JSX closing tag for 'div'.* SonarQube: *Failed to parse file at line 220* (pesan sama) |

Fungsi di berkas ini tidak terhitung oleh kedua alat.

## 6. Perbandingan ESLint vs SonarQube (cakupan A)

Dicocokkan per (berkas, baris); fungsi yang berbagi baris (arrow function bertingkat)
dibandingkan sebagai multiset. Detail: `audit/sonar/perbandingan.txt`.

| Metrik | ESLint | SonarQube | Sama | Berbeda |
|---|---|---|---|---|
| CogC (sonarjs vs S3776) | 597 fungsi CogC > 0 | 597 issue | **597 (100%)** | 0 |
| CC (complexity vs S1541) | 1656 fungsi | 1656 issue | 1467 (88,6%) | 189 (11,4%) |

- **CogC**: identik penuh. Kedua alat memakai implementasi Sonar yang sama. Dengan ambang 0, fungsi
  dengan CogC = 0 tidak dilaporkan oleh keduanya (1656 − 597 = 1059 fungsi ber-CogC 0).
- **CC**: jumlah fungsi sama persis, tetapi pada semua 187 lokasi yang berbeda nilai ESLint lebih
  besar (tidak ada kasus SonarQube lebih besar). Penyebab: rule `complexity` ESLint juga menghitung
  *optional chaining* (`?.`), nilai default parameter, dan operator penugasan logis, sedangkan S1541
  tidak. Contoh: `features/publications/service.ts:80` `getAll` ESLint 16 vs SonarQube 9; fungsi ini
  memuat tepat 7 operator `?.` (16 − 9 = 7).

Contoh perbedaan terbesar:

| Berkas:baris | ESLint | SonarQube |
|---|---|---|
| features/governance/components/UserForm.tsx:25 | 21 | 13 |
| features/courses/components/CourseManager.tsx:19 | 32 | 25 |
| features/publications/service.ts:80 | 16 | 9 |
| features/publications/service.ts:143 | 16 | 9 |
| features/attendance/components/AttendanceModal.tsx:33 | 18 | 12 |
| features/practicum/components/ModuleManager.tsx:14 | 29 | 24 |

Implikasi: kategori risiko CC bergantung pada alat; laporkan alat yang menjadi acuan klasifikasi.

### Catatan kualitas data

`audit_per_fungsi.csv` (dari `ringkas_audit.py`) menggabungkan CogC ke fungsi berdasarkan
(berkas, baris) tanpa kolom. Pada 10 lokasi dengan beberapa arrow function di baris yang sama
(28 baris CSV), nilai CogC fungsi terluar ikut tersalin ke fungsi lain di baris itu. Kolom CC dan
tabel distribusi risiko tidak terpengaruh. Perbandingan di atas memakai JSON mentah sehingga
tidak terkena masalah ini.

Perubahan pada `ringkas_audit.py`: hanya menambahkan `"ObjectSkripsi/"` ke daftar akar path
(nama folder fork), agar path relatif dan cakupan A terbaca. Logika perhitungan tidak diubah.

## 7. Berkas keluaran

| Berkas | Isi |
|---|---|
| `audit/hasil_audit.json` | Keluaran mentah ESLint |
| `audit/audit_per_fungsi.csv` | CC/CogC per fungsi (ESLint) |
| `audit/sonar/measures_component_tree.json`, `sonar_per_berkas.csv` | Metrik per berkas SonarQube (203 berkas) |
| `audit/sonar/issues_kompleksitas.json`, `sonar_per_fungsi.csv` | Issue S3776/S1541 per fungsi |
| `audit/sonar/perbandingan.txt` | Hasil perbandingan |
| `audit/sonar/ambil_sonar.py`, `bandingkan.py` | Skrip pengambilan dan perbandingan |

## 8. Tangkapan layar dashboard SonarQube

Simpan di `audit/sonar/screenshots/`:
- `overview.png` — halaman proyek lab-industri (Overview)
- `measures_complexity.png` — Measures → Complexity
- `quality_profile.png` — Quality Profiles → Audit Kompleksitas (aturan S3776/S1541)
